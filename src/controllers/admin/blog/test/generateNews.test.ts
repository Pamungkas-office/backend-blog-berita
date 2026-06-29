import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { generateNews } from "../generateNews";
import { serviceGenerateContent } from "../../../../services/admin/blog/generateNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/generateNews", () => ({
  serviceGenerateContent: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post("/api/admin/posts/generate", generateNews);

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

describe("CONTROLLER: POST /api/admin/posts/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with generated content", async () => {
    const mockContent = {
      title: "Generated News",
      news: "<p>Content here</p>",
      category: ["Tech"],
      tags: ["javascript", "web"],
      meta_title: "Generated News",
      meta_description: "Description",
      provider: "gemini",
    };
    (serviceGenerateContent as jest.Mock).mockResolvedValue(mockContent);

    const response = await request(app)
      .post("/api/admin/posts/generate")
      .send({ url: "https://example.com/news/1" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Berita berhasil digenerate",
      data: mockContent,
    });
    expect(serviceGenerateContent).toHaveBeenCalledWith("https://example.com/news/1");
  });

  it("ERROR: should return 400 when URL is missing", async () => {
    const response = await request(app)
      .post("/api/admin/posts/generate")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceGenerateContent).not.toHaveBeenCalled();
  });

  it("ERROR: should return 502 when AI service fails", async () => {
    (serviceGenerateContent as jest.Mock).mockRejectedValue(
      new CustomError("Semua provider AI gagal.", 502),
    );

    const response = await request(app)
      .post("/api/admin/posts/generate")
      .send({ url: "https://example.com/news/1" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      success: false,
      message: "Semua provider AI gagal.",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceGenerateContent as jest.Mock).mockRejectedValue(new Error("Network error"));

    const response = await request(app)
      .post("/api/admin/posts/generate")
      .send({ url: "https://example.com/news/1" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
