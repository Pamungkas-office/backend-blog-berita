import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { saveGeneratedNews } from "../saveGeneratedNews";
import { serviceSaveGenerated } from "../../../../services/admin/blog/saveGeneratedNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/saveGeneratedNews");

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "admin@test.com", role: "admin" };
  next();
});
app.post("/api/admin/posts/save-generated", saveGeneratedNews);

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

describe("CONTROLLER: POST /api/admin/posts/save-generated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with saved post data", async () => {
    const mockPost = { id: 1, title: "Generated News", status: "draft" };
    (serviceSaveGenerated as jest.Mock).mockResolvedValue(mockPost);

    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({
        title: "Generated News",
        news: "<p>Content here</p>",
        category: ["Tech"],
        tags: ["javascript", "web"],
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Berita berhasil disimpan sebagai draft",
      data: mockPost,
    });
    expect(serviceSaveGenerated).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: "Generated News",
        news: "<p>Content here</p>",
        category: ["Tech"],
        tags: ["javascript", "web"],
      }),
    );
  });

  it("ERROR: should return 400 when title is missing", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({ news: "<p>Content</p>", category: ["Tech"], tags: ["js"] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when news is missing", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({ title: "Title", category: ["Tech"], tags: ["js"] });

    expect(response.status).toBe(400);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when category is empty array", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({ title: "Title", news: "<p>Content</p>", category: [], tags: ["js"] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when tags is empty array", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({ title: "Title", news: "<p>Content</p>", category: ["Tech"], tags: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when category exceeds max 3", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({
        title: "Title",
        news: "<p>Content</p>",
        category: ["Tech", "Sports", "Health", "Business"],
        tags: ["js"],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when tags exceeds max 5", async () => {
    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({
        title: "Title",
        news: "<p>Content</p>",
        category: ["Tech"],
        tags: ["a", "b", "c", "d", "e", "f"],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceSaveGenerated).not.toHaveBeenCalled();
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceSaveGenerated as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/admin/posts/save-generated")
      .send({ title: "Title", news: "<p>Content</p>", category: ["Tech"], tags: ["js"] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
