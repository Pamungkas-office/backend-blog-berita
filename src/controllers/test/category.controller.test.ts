import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getAllCategories } from "../category.controller";

const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockOrderBy = jest.fn();

jest.mock("../../lib/db/db", () => ({
  db: { select: () => ({ from: () => ({ orderBy: mockOrderBy }) }) },
}));

const app = express();
app.get("/api/categories", getAllCategories);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: GET /api/categories", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with categories list", async () => {
    const mockData = [{ id: 1, name: "Tech", slug: "tech" }];
    mockOrderBy.mockResolvedValue(mockData);

    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Daftar kategori berhasil diambil", data: mockData,
    });
  });

  it("SUCCESS: should return 200 with empty array", async () => {
    mockOrderBy.mockResolvedValue([]);
    const response = await request(app).get("/api/categories");
    expect(response.body.data).toEqual([]);
  });

  it("ERROR: should return 500 when db throws", async () => {
    mockOrderBy.mockRejectedValue(new Error("DB error"));
    const response = await request(app).get("/api/categories");
    expect(response.status).toBe(500);
  });
});
