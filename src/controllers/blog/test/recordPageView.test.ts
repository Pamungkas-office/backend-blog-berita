import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { recordPageViewController } from "../recordPageView";
import { getPostIdBySlug, recordPageView } from "../../../services/user/blog/pageView.service";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/blog/pageView.service");

const app = express();
app.post("/api/posts/:slug/view", recordPageViewController);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: POST /api/posts/:slug/view", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should record view with visitorId", async () => {
    (getPostIdBySlug as jest.Mock).mockResolvedValue(1);
    (recordPageView as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/posts/post-1/view")
      .set("x-visitor-id", "visitor-123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "View recorded", data: null,
    });
    expect(getPostIdBySlug).toHaveBeenCalledWith("post-1");
    expect(recordPageView).toHaveBeenCalledWith({
      postId: 1, userId: null, visitorId: "visitor-123",
    });
  });

  it("SUCCESS: should record view without visitorId", async () => {
    (getPostIdBySlug as jest.Mock).mockResolvedValue(1);
    (recordPageView as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).post("/api/posts/post-1/view");

    expect(response.status).toBe(200);
    expect(recordPageView).toHaveBeenCalledWith({
      postId: 1, userId: null, visitorId: "",
    });
  });

  it("ERROR: should return 404 when post slug does not exist", async () => {
    (getPostIdBySlug as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/posts/nonexistent/view");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false, message: "Post tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws", async () => {
    (getPostIdBySlug as jest.Mock).mockResolvedValue(1);
    (recordPageView as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/posts/post-1/view")
      .set("x-visitor-id", "visitor-123");

    expect(response.status).toBe(500);
  });
});
