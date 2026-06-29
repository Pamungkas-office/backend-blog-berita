import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { deleteComment } from "../deleteComment";
import { serviceDeleteComment as serviceUserDeleteComment } from "../../../services/user/comments/deleteComment";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/comments/deleteComment");

const app = express();
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "user@test.com", role: "user" };
  next();
});
app.delete("/api/comments/:id", deleteComment);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: DELETE /api/comments/:id", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 when comment is deleted", async () => {
    (serviceUserDeleteComment as jest.Mock).mockResolvedValue({ id: 1 });

    const response = await request(app).delete("/api/comments/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe("Komentar berhasil dihapus");
    expect(serviceUserDeleteComment).toHaveBeenCalledWith(1, 1);
  });

  it("ERROR: should return 404 when comment not found", async () => {
    (serviceUserDeleteComment as jest.Mock).mockRejectedValue(
      new CustomError("Komentar tidak ditemukan", 404),
    );
    const response = await request(app).delete("/api/comments/999");
    expect(response.status).toBe(404);
  });

  it("ERROR: should return 403 when user is not the owner", async () => {
    (serviceUserDeleteComment as jest.Mock).mockRejectedValue(
      new CustomError("Anda tidak memiliki akses untuk menghapus komentar ini", 403),
    );
    const response = await request(app).delete("/api/comments/1");
    expect(response.status).toBe(403);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceUserDeleteComment as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app).delete("/api/comments/1");
    expect(response.status).toBe(500);
  });
});
