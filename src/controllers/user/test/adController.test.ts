import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { getActiveAd } from "../adController";
import { serviceGetActiveAdByPosition } from "../../../services/admin/ad/adService";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/admin/ad/adService");

const app = express();
app.get("/api/ad-positions/:position", getActiveAd);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validasi gagal" });
  }
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: GET /api/ad-positions/:position", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with active ad", async () => {
    const mockAd = { id: 1, position: "header", is_active: true };
    (serviceGetActiveAdByPosition as jest.Mock).mockResolvedValue(mockAd);

    const response = await request(app).get("/api/ad-positions/header");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Iklan ditemukan", data: mockAd,
    });
    expect(serviceGetActiveAdByPosition).toHaveBeenCalledWith("header");
  });

  it("SUCCESS: should return 200 with null when no active ad", async () => {
    (serviceGetActiveAdByPosition as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get("/api/ad-positions/sidebar");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Tidak ada iklan aktif untuk posisi ini", data: null,
    });
  });

  it("ERROR: should return 400 when position is invalid", async () => {
    const response = await request(app).get("/api/ad-positions/invalid");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: "Validasi gagal" });
    expect(serviceGetActiveAdByPosition).not.toHaveBeenCalled();
  });

  it("ERROR: should return 500 when service throws", async () => {
    (serviceGetActiveAdByPosition as jest.Mock).mockRejectedValue(new Error("err"));
    const response = await request(app).get("/api/ad-positions/header");
    expect(response.status).toBe(500);
  });
});
