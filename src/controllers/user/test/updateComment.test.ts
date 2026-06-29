import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { updateComment } from "../updateComment";
import { serviceUpdateComment } from "../../../services/user/comments/updateComment";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/comments/updateComment");

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "user@test.com", role: "user" };
  next();
});
app.patch("/api/comments/:id", updateComment);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: PATCH /api/comments/:id", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with updated comment", async () => {
    const mockUpdated = { id: 1, comment: "Updated comment", user_id: 1 };
    (serviceUpdateComment as jest.Mock).mockResolvedValue(mockUpdated);

    const response = await request(app)
      .patch("/api/comments/1")
      .send({ comment: "Updated comment" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Komentar berhasil diperbarui", data: mockUpdated,
    });
    expect(serviceUpdateComment).toHaveBeenCalledWith(1, 1, "Updated comment");
  });

  it("ERROR: should return 404 when comment not found", async () => {
    (serviceUpdateComment as jest.Mock).mockRejectedValue(
      new CustomError("Komentar tidak ditemukan", 404),
    );
    const response = await request(app)
      .patch("/api/comments/999")
      .send({ comment: "Updated" });
    expect(response.status).toBe(404);
  });

  it("ERROR: should return 403 when user is not the owner", async () => {
    (serviceUpdateComment as jest.Mock).mockRejectedValue(
      new CustomError("Anda tidak memiliki akses untuk mengubah komentar ini", 403),
    );
    const response = await request(app)
      .patch("/api/comments/1")
      .send({ comment: "Hacked!" });
    expect(response.status).toBe(403);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceUpdateComment as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app)
      .patch("/api/comments/1")
      .send({ comment: "Updated" });
    expect(response.status).toBe(500);
  });
});
