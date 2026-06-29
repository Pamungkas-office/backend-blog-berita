import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../../lib/custom-error";
import { deleteComment } from "../deleteComment";
import { serviceDeleteComment } from "../../../../services/admin/comment/deleteComment";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/comment/deleteComment");

const app = express();
app.delete("/api/admin/comments/:id", deleteComment);

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

describe("CONTROLLER: DELETE /api/admin/comments/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when comment is deleted", async () => {
    (serviceDeleteComment as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete("/api/admin/comments/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Komentar berhasil dihapus",
      data: null,
    });
    expect(serviceDeleteComment).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 404 when comment does not exist", async () => {
    (serviceDeleteComment as jest.Mock).mockRejectedValue(
      new CustomError("Komentar tidak ditemukan", 404),
    );

    const response = await request(app).delete("/api/admin/comments/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Komentar tidak ditemukan",
    });
    expect(serviceDeleteComment).toHaveBeenCalledWith(999);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceDeleteComment as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).delete("/api/admin/comments/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
