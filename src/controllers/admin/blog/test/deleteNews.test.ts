import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../../lib/custom-error";
import { deleteNews } from "../deleteNews";
import { serviceDeletePost } from "../../../../services/admin/blog/deleteNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/deleteNews");

const app = express();
app.delete("/api/admin/posts/:id", deleteNews);

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

describe("CONTROLLER: DELETE /api/admin/posts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when post is deleted", async () => {
    (serviceDeletePost as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete("/api/admin/posts/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Berita berhasil dihapus",
      data: null,
    });
    expect(serviceDeletePost).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 404 when post does not exist", async () => {
    (serviceDeletePost as jest.Mock).mockRejectedValue(
      new CustomError("Post tidak ditemukan", 404),
    );

    const response = await request(app).delete("/api/admin/posts/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Post tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceDeletePost as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).delete("/api/admin/posts/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
