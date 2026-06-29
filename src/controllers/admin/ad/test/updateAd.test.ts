import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { updateAd } from "../updateAd";
import { serviceUpdateAd } from "../../../../services/admin/ad/adService";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/ad/adService");

const app = express();
app.use(express.json());
app.put("/api/admin/ad-positions/:id", updateAd);

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

describe("CONTROLLER: PUT /api/admin/ad-positions/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with updated ad data when body and id are valid", async () => {
    const mockAd = { id: 1, position: "header", ad_code: "<script>new</script>", is_active: false };
    (serviceUpdateAd as jest.Mock).mockResolvedValue(mockAd);

    const response = await request(app)
      .put("/api/admin/ad-positions/1")
      .send({ ad_code: "<script>new</script>", is_active: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Iklan berhasil diperbarui",
      data: mockAd,
    });
    expect(serviceUpdateAd).toHaveBeenCalledWith(1, {
      ad_code: "<script>new</script>",
      is_active: false,
    });
  });

  it("ERROR: should return 400 when id is not a number", async () => {
    const response = await request(app)
      .put("/api/admin/ad-positions/abc")
      .send({ ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "ID tidak valid",
    });
    expect(serviceUpdateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when ad_code is empty", async () => {
    const response = await request(app)
      .put("/api/admin/ad-positions/1")
      .send({ ad_code: "", is_active: true });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when is_active is missing", async () => {
    const response = await request(app)
      .put("/api/admin/ad-positions/1")
      .send({ ad_code: "<script>...</script>" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .put("/api/admin/ad-positions/1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceUpdateAd).not.toHaveBeenCalled();
  });

  it("ERROR: should return 404 when ad does not exist", async () => {
    (serviceUpdateAd as jest.Mock).mockRejectedValue(
      new CustomError("Iklan tidak ditemukan", 404),
    );

    const response = await request(app)
      .put("/api/admin/ad-positions/999")
      .send({ ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Iklan tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceUpdateAd as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/admin/ad-positions/1")
      .send({ ad_code: "<script>...</script>", is_active: true });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
