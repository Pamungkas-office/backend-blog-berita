import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { updateNews } from "../updateNews";
import { serviceUpdatePost } from "../../../../services/admin/blog/updateNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/updateNews");
jest.mock("../../../../utils/slug", () => ({
  generateSlug: jest.fn((title: string) => title.toLowerCase().replace(/\s+/g, "-")),
}));
jest.mock("../../../../lib/upload", () => ({
  MediaService: { uploadThumbnail: jest.fn() },
}));

const app = express();
app.use(express.json());
app.put("/api/admin/posts/:id", updateNews);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: PUT /api/admin/posts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with updated post data", async () => {
    const mockPost = { id: 1, title: "Updated Title", status: "published" };
    (serviceUpdatePost as jest.Mock).mockResolvedValue(mockPost);

    const response = await request(app)
      .put("/api/admin/posts/1")
      .send({ title: "Updated Title", content: "Updated content here...", status: "published" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Berita berhasil diperbarui",
      data: mockPost,
    });
    expect(serviceUpdatePost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ title: "Updated Title", slug: "updated-title" }),
    );
  });

  it("SUCCESS: should auto-generate slug from title when only title is provided", async () => {
    (serviceUpdatePost as jest.Mock).mockResolvedValue({ id: 1 });

    await request(app)
      .put("/api/admin/posts/1")
      .send({ title: "New Title Here", content: "Updated content here...", status: "published" });

    expect(serviceUpdatePost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ slug: "new-title-here" }),
    );
  });

  it("SUCCESS: should use provided slug when both title and slug are given", async () => {
    (serviceUpdatePost as jest.Mock).mockResolvedValue({ id: 1 });

    await request(app)
      .put("/api/admin/posts/1")
      .send({ title: "New Title", slug: "custom-slug", content: "Updated content here...", status: "published" });

    expect(serviceUpdatePost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ slug: "custom-slug" }),
    );
  });

  it("ERROR: should return 400 when title is too short", async () => {
    const response = await request(app)
      .put("/api/admin/posts/1")
      .send({ title: "Abc" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceUpdatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when content is too short", async () => {
    const response = await request(app)
      .put("/api/admin/posts/1")
      .send({ content: "Short" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceUpdatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 404 when post does not exist", async () => {
    (serviceUpdatePost as jest.Mock).mockRejectedValue(
      new CustomError("Post tidak ditemukan", 404),
    );

    const response = await request(app)
      .put("/api/admin/posts/999")
      .send({ title: "Valid Title Here", content: "Valid content here for update", status: "draft" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Post tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceUpdatePost as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/admin/posts/1")
      .send({ title: "Valid Title Here", content: "Valid content here for update", status: "draft" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
