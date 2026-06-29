import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getAllComments } from "../getAllComments";
import { serviceGetAllComments } from "../../../../services/admin/comment/getAllComments";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/comment/getAllComments");

const app = express();
app.get("/api/admin/comments", getAllComments);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: GET /api/admin/comments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with paginated comments", async () => {
    const mockResult = {
      data: [
        { id: 1, comment: "Great article!", created_at: "2024-01-01", post: { id: 1, title: "Post 1", slug: "post-1" }, user: { id: 1, name: "John" } },
        { id: 2, comment: "Nice post!", created_at: "2024-01-02", post: { id: 1, title: "Post 1", slug: "post-1" }, user: { id: 2, name: "Jane" } },
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    (serviceGetAllComments as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app).get("/api/admin/comments");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Daftar komentar berhasil diambil",
      data: mockResult,
    });
    expect(serviceGetAllComments).toHaveBeenCalledWith(1, 10);
  });

  it("SUCCESS: should use custom page and limit from query params", async () => {
    const mockResult = { data: [], pagination: { page: 2, limit: 5, total: 0, totalPages: 0 } };
    (serviceGetAllComments as jest.Mock).mockResolvedValue(mockResult);

    await request(app).get("/api/admin/comments?page=2&limit=5");

    expect(serviceGetAllComments).toHaveBeenCalledWith(2, 5);
  });

  it("SUCCESS: should clamp limit to maximum 100", async () => {
    const mockResult = { data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } };
    (serviceGetAllComments as jest.Mock).mockResolvedValue(mockResult);

    await request(app).get("/api/admin/comments?limit=500");

    expect(serviceGetAllComments).toHaveBeenCalledWith(1, 100);
  });

  it("SUCCESS: should return 200 with empty comments list", async () => {
    const emptyResult = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    (serviceGetAllComments as jest.Mock).mockResolvedValue(emptyResult);

    const response = await request(app).get("/api/admin/comments");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(emptyResult);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceGetAllComments as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/admin/comments");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
