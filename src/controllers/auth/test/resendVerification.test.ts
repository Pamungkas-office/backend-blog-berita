import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { resendVerification } from "../resendVerification";
import { serviceResendVerification } from "../../../services/auth/resendVerification";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/resendVerification");

const app = express();
app.use(express.json());
app.post("/api/auth/resend-verification", resendVerification);

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

describe("CONTROLLER: POST /api/auth/resend-verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when email is registered but not verified", async () => {
    (serviceResendVerification as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim.",
      data: null,
    });
    expect(serviceResendVerification).toHaveBeenCalledWith("john@test.com");
  });

  it("SUCCESS: should return 200 even when email is not registered", async () => {
    (serviceResendVerification as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "unknown@test.com" });

    expect(response.status).toBe(200);
    expect(serviceResendVerification).toHaveBeenCalledWith("unknown@test.com");
  });

  it("ERROR: should return 400 when email is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceResendVerification).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when email is already verified", async () => {
    (serviceResendVerification as jest.Mock).mockRejectedValue(
      new CustomError("Email sudah diverifikasi", 400),
    );

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "verified@test.com" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Email sudah diverifikasi",
    });
  });

  it("ERROR: should return 429 when previous token is still valid", async () => {
    (serviceResendVerification as jest.Mock).mockRejectedValue(
      new CustomError("Link verifikasi sebelumnya masih berlaku. Silakan cek email Anda.", 429),
    );

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      message: "Link verifikasi sebelumnya masih berlaku. Silakan cek email Anda.",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceResendVerification as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
