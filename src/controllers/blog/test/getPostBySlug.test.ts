import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { getPostBySlug } from "../getPostBySlug";
import { serviceGetPostBySlug } from "../../../services/user/blog/getPostBySlug";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/blog/getPostBySlug");

const app = express();
app.get("/api/posts/:slug", getPostBySlug);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: GET /api/posts/:slug", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with post data", async () => {
    const mockPost = { id: 1, title: "Post 1", slug: "post-1" };
    (serviceGetPostBySlug as jest.Mock).mockResolvedValue(mockPost);

    const response = await request(app).get("/api/posts/post-1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Detail post berhasil diambil", data: mockPost,
    });
    expect(serviceGetPostBySlug).toHaveBeenCalledWith("post-1");
  });

  it("ERROR: should return 404 when post not found", async () => {
    (serviceGetPostBySlug as jest.Mock).mockRejectedValue(new CustomError("Post tidak ditemukan", 404));
    const response = await request(app).get("/api/posts/nonexistent");
    expect(response.status).toBe(404);
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceGetPostBySlug as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app).get("/api/posts/post-1");
    expect(response.status).toBe(500);
  });
});
