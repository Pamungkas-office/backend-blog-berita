import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { verifyEmail } from "../verifyEmail";
import { serviceVerifyEmail } from "../../../services/auth/verifyEmail";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/verifyEmail");

const app = express();
app.get("/api/auth/verify-email", verifyEmail);

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

describe("CONTROLLER: GET /api/auth/verify-email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when token is valid", async () => {
    (serviceVerifyEmail as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "valid-token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Email berhasil diverifikasi. Silakan login.",
      data: null,
    });
    expect(serviceVerifyEmail).toHaveBeenCalledWith("valid-token");
  });

  it("ERROR: should return 400 when token query param is missing", async () => {
    const response = await request(app).get("/api/auth/verify-email");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceVerifyEmail).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when token is empty", async () => {
    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceVerifyEmail).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when token is invalid", async () => {
    (serviceVerifyEmail as jest.Mock).mockRejectedValue(
      new CustomError("Token verifikasi tidak valid", 400),
    );

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "invalid-token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Token verifikasi tidak valid",
    });
  });

  it("ERROR: should return 400 when email is already verified", async () => {
    (serviceVerifyEmail as jest.Mock).mockRejectedValue(
      new CustomError("Email sudah diverifikasi sebelumnya", 400),
    );

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "already-verified-token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Email sudah diverifikasi sebelumnya",
    });
  });

  it("ERROR: should return 400 when token is expired", async () => {
    (serviceVerifyEmail as jest.Mock).mockRejectedValue(
      new CustomError("Token verifikasi sudah kedaluwarsa. Silakan minta link verifikasi baru.", 400),
    );

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "expired-token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Token verifikasi sudah kedaluwarsa. Silakan minta link verifikasi baru.",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceVerifyEmail as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "valid-token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
