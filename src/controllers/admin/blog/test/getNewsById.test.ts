import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../../lib/custom-error";
import { getNewsById } from "../getNewsById";
import { serviceGetPostById } from "../../../../services/admin/blog/getPostById";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/getPostById");

const app = express();
app.get("/api/admin/posts/:id", getNewsById);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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

describe("CONTROLLER: GET /api/admin/posts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with post data", async () => {
    const mockPost = { id: 1, title: "News 1", content: "Content", status: "published" };
    (serviceGetPostById as jest.Mock).mockResolvedValue(mockPost);

    const response = await request(app).get("/api/admin/posts/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Detail berita berhasil diambil",
      data: mockPost,
    });
    expect(serviceGetPostById).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 404 when post does not exist", async () => {
    (serviceGetPostById as jest.Mock).mockRejectedValue(
      new CustomError("Post tidak ditemukan", 404),
    );

    const response = await request(app).get("/api/admin/posts/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Post tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceGetPostById as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/admin/posts/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
