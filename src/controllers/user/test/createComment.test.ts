import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { createComment } from "../createComment";
import { serviceCreateComment } from "../../../services/user/comments/createComment";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/comments/createComment");

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "user@test.com", role: "user" };
  next();
});
app.post("/api/comments/:slug", createComment);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: POST /api/comments/:slug", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 201 with created comment", async () => {
    const mockComment = { id: 1, comment: "Great post!", post_id: 1, user_id: 1 };
    (serviceCreateComment as jest.Mock).mockResolvedValue(mockComment);

    const response = await request(app)
      .post("/api/comments/post-1")
      .send({ comment: "Great post!" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true, message: "Komentar berhasil ditambahkan", data: mockComment,
    });
    expect(serviceCreateComment).toHaveBeenCalledWith(1, "post-1", "Great post!");
  });

  it("ERROR: should return 404 when post not found", async () => {
    (serviceCreateComment as jest.Mock).mockRejectedValue(
      new CustomError("Postingan tidak ditemukan", 404),
    );
    const response = await request(app)
      .post("/api/comments/nonexistent")
      .send({ comment: "Nice!" });
    expect(response.status).toBe(404);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceCreateComment as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app)
      .post("/api/comments/post-1")
      .send({ comment: "Nice!" });
    expect(response.status).toBe(500);
  });
});
