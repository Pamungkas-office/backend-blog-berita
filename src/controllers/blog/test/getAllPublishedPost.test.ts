import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getAllPublishedPost } from "../getAllPublishedPost";
import { serviceGetPublishedPosts } from "../../../services/user/blog/getPublishedPosts";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/blog/getPublishedPosts");

const app = express();
app.get("/api/posts", getAllPublishedPost);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: GET /api/posts", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with published posts", async () => {
    const mockPosts = [{ id: 1, title: "Post 1", slug: "post-1", status: "published" }];
    (serviceGetPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);

    const response = await request(app).get("/api/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Daftar post berhasil diambil", data: mockPosts,
    });
  });

  it("SUCCESS: should return 200 with empty array", async () => {
    (serviceGetPublishedPosts as jest.Mock).mockResolvedValue([]);
    const response = await request(app).get("/api/posts");
    expect(response.body.data).toEqual([]);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceGetPublishedPosts as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app).get("/api/posts");
    expect(response.status).toBe(500);
  });
});
