import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { deleteAd } from "../deleteAd";
import { serviceDeleteAd } from "../../../../services/admin/ad/adService";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/ad/adService");

const app = express();
app.delete("/api/admin/ad-positions/:id", deleteAd);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validasi gagal" });
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

describe("CONTROLLER: DELETE /api/admin/ad-positions/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when ad is deleted", async () => {
    (serviceDeleteAd as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete("/api/admin/ad-positions/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Iklan berhasil dihapus",
      data: null,
    });
    expect(serviceDeleteAd).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 400 when id is not a number", async () => {
    const response = await request(app).delete("/api/admin/ad-positions/abc");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "ID tidak valid",
    });
    expect(serviceDeleteAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 404 when ad does not exist", async () => {
    (serviceDeleteAd as jest.Mock).mockRejectedValue(
      new CustomError("Iklan tidak ditemukan", 404),
    );

    const response = await request(app).delete("/api/admin/ad-positions/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Iklan tidak ditemukan",
    });
    expect(serviceDeleteAd).toHaveBeenCalledWith(999);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceDeleteAd as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).delete("/api/admin/ad-positions/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
