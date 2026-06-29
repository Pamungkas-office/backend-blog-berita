import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { createNewNews } from "../createNewNews";
import { serviceCreatePost } from "../../../../services/admin/blog/createNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/createNews");
jest.mock("../../../../utils/slug", () => ({
  generateSlug: jest.fn((title: string) => title.toLowerCase().replace(/\s+/g, "-")),
}));

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "admin@test.com", role: "admin" };
  next();
});
app.post("/api/admin/posts", createNewNews);

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

describe("CONTROLLER: POST /api/admin/posts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with post data when body is valid", async () => {
    const mockPost = { id: 1, title: "Test News", status: "draft", slug: "test-news" };
    (serviceCreatePost as jest.Mock).mockResolvedValue(mockPost);

    const response = await request(app)
      .post("/api/admin/posts")
      .send({
        title: "Test News",
        content: "This is the content of the news article",
        status: "draft",
        category_id: 1,
        tag_ids: [1, 2],
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Berita berhasil dibuat",
      data: mockPost,
    });
    expect(serviceCreatePost).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: "Test News",
        slug: "test-news",
        status: "draft",
        category_id: 1,
        tag_ids: [1, 2],
      }),
      undefined,
    );
  });

  it("ERROR: should return 400 when title is missing", async () => {
    const response = await request(app)
      .post("/api/admin/posts")
      .send({ content: "Content", status: "draft", category_id: 1 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceCreatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when content is missing", async () => {
    const response = await request(app)
      .post("/api/admin/posts")
      .send({ title: "Test", status: "draft", category_id: 1 });

    expect(response.status).toBe(400);
    expect(serviceCreatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when status is invalid enum", async () => {
    const response = await request(app)
      .post("/api/admin/posts")
      .send({ title: "Test", content: "Content", status: "archived", category_id: 1 });

    expect(response.status).toBe(400);
    expect(serviceCreatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when category_id is not a number", async () => {
    const response = await request(app)
      .post("/api/admin/posts")
      .send({ title: "Test", content: "Content", status: "draft", category_id: "abc" });

    expect(response.status).toBe(400);
    expect(serviceCreatePost).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when slug already exists", async () => {
    (serviceCreatePost as jest.Mock).mockRejectedValue(
      new CustomError("Slug post sudah digunakan", 409),
    );

    const response = await request(app)
      .post("/api/admin/posts")
      .send({ title: "Test News", content: "Content", status: "draft", category_id: 1 });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Slug post sudah digunakan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceCreatePost as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/admin/posts")
      .send({ title: "Test News", content: "Content", status: "draft", category_id: 1 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
