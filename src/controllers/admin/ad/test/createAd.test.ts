import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { createAd } from "../createAd";
import { serviceCreateAd } from "../../../../services/admin/ad/adService";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/ad/adService");

const app = express();
app.use(express.json());
app.post("/api/admin/ad-positions", createAd);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    });
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

describe("CONTROLLER: POST /api/admin/ad-positions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with ad data when body is valid", async () => {
    const mockAd = { id: 1, position: "header", ad_code: "<script>...</script>", is_active: true };
    (serviceCreateAd as jest.Mock).mockResolvedValue(mockAd);

    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "header", ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Iklan berhasil dibuat",
      data: mockAd,
    });
    expect(serviceCreateAd).toHaveBeenCalledWith("header", "<script>...</script>", true);
  });

  it("SUCCESS: should default is_active to true when not provided", async () => {
    const mockAd = { id: 2, position: "sidebar", ad_code: "<script>...</script>", is_active: true };
    (serviceCreateAd as jest.Mock).mockResolvedValue(mockAd);

    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "sidebar", ad_code: "<script>...</script>" });

    expect(response.status).toBe(201);
    expect(serviceCreateAd).toHaveBeenCalledWith("sidebar", "<script>...</script>", true);
  });

  it("ERROR: should return 400 when position is invalid enum value", async () => {
    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "invalid", ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when ad_code is empty", async () => {
    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "header", ad_code: "", is_active: true });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceCreateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when position already has an ad", async () => {
    (serviceCreateAd as jest.Mock).mockRejectedValue(
      new CustomError('Posisi "header" sudah memiliki kode iklan. Edit yang sudah ada atau hapus terlebih dahulu.', 409),
    );

    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "header", ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: 'Posisi "header" sudah memiliki kode iklan. Edit yang sudah ada atau hapus terlebih dahulu.',
    });
    expect(serviceCreateAd).toHaveBeenCalledWith("header", "<script>...</script>", true);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceCreateAd as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/admin/ad-positions")
      .send({ position: "header", ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
