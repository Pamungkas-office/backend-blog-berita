import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { getAllAds } from "../getAllAds";
import { serviceGetAllAds } from "../../../../services/admin/ad/adService";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/ad/adService");

const app = express();
app.get("/api/admin/ad-positions", getAllAds);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validasi gagal" });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: GET /api/admin/ad-positions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with list of ads", async () => {
    const mockAds = [
      { id: 1, position: "header", ad_code: "<script>...</script>", is_active: true },
      { id: 2, position: "sidebar", ad_code: "<script>...</script>", is_active: false },
    ];
    (serviceGetAllAds as jest.Mock).mockResolvedValue(mockAds);

    const response = await request(app).get("/api/admin/ad-positions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Daftar iklan berhasil diambil",
      data: mockAds,
    });
    expect(serviceGetAllAds).toHaveBeenCalled();
  });

  it("SUCCESS: should return 200 with empty array when no ads exist", async () => {
    (serviceGetAllAds as jest.Mock).mockResolvedValue([]);

    const response = await request(app).get("/api/admin/ad-positions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Daftar iklan berhasil diambil",
      data: [],
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceGetAllAds as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/admin/ad-positions");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
