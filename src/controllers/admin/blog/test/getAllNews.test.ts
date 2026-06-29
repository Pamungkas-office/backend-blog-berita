import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getAllNews } from "../getAllNews";
import { getAllNewsAdmin } from "../../../../services/admin/blog/getAllNews";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/blog/getAllNews");

const app = express();
app.get("/api/admin/posts", getAllNews);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: GET /api/admin/posts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with list of news", async () => {
    const mockNews = [
      { id: 1, title: "News 1", status: "published", view_count: 10, category: { id: 1, name: "Tech" } },
      { id: 2, title: "News 2", status: "draft", view_count: 0, category: { id: 2, name: "Sports" } },
    ];
    (getAllNewsAdmin as jest.Mock).mockResolvedValue(mockNews);

    const response = await request(app).get("/api/admin/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Daftar berita berhasil diambil",
      data: mockNews,
    });
    expect(getAllNewsAdmin).toHaveBeenCalled();
  });

  it("SUCCESS: should return 200 with empty array when no news exist", async () => {
    (getAllNewsAdmin as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get("/api/admin/posts");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (getAllNewsAdmin as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/admin/posts");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
