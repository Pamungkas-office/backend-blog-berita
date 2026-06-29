import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getComments } from "../getComments";
import { serviceGetComments } from "../../../services/user/comments/getComments";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/comments/getComments");

const app = express();
app.get("/api/comments/:slug", getComments);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: GET /api/comments/:slug", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with comments list", async () => {
    const mockComments = [
      { id: 1, comment: "Great!", created_at: "2024-01-01", post_id: 1, user: { id: 1, name: "John" } },
    ];
    (serviceGetComments as jest.Mock).mockResolvedValue(mockComments);

    const response = await request(app).get("/api/comments/post-1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Berhasil mendapatkan data komentar", data: mockComments,
    });
    expect(serviceGetComments).toHaveBeenCalledWith("post-1");
  });

  it("SUCCESS: should return 200 with empty array", async () => {
    (serviceGetComments as jest.Mock).mockResolvedValue([]);
    const response = await request(app).get("/api/comments/post-1");
    expect(response.body.data).toEqual([]);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceGetComments as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app).get("/api/comments/post-1");
    expect(response.status).toBe(500);
  });
});
