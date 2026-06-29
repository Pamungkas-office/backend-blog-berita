import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { forgotPassword } from "../forgotPassword";
import { serviceForgotPassword } from "../../../services/auth/forgotPassword";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/forgotPassword");

const app = express();
app.use(express.json());
app.post("/api/password/forgot", forgotPassword);

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

describe("CONTROLLER: POST /api/password/forgot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 even when email is registered", async () => {
    (serviceForgotPassword as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post("/api/password/forgot")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Jika email terdaftar, link reset password telah dikirim.",
      data: null,
    });
    expect(serviceForgotPassword).toHaveBeenCalledWith("john@test.com");
  });

  it("SUCCESS: should return 200 even when email is not registered", async () => {
    (serviceForgotPassword as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post("/api/password/forgot")
      .send({ email: "unknown@test.com" });

    expect(response.status).toBe(200);
    expect(serviceForgotPassword).toHaveBeenCalledWith("unknown@test.com");
  });

  it("ERROR: should return 400 when email is invalid", async () => {
    const response = await request(app)
      .post("/api/password/forgot")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(serviceForgotPassword).not.toHaveBeenCalled();
  });

  it("ERROR: should return 429 when requested too frequently", async () => {
    (serviceForgotPassword as jest.Mock).mockRejectedValue(
      new CustomError("Silakan tunggu 30 menit sebelum meminta ulang link reset password", 429),
    );

    const response = await request(app)
      .post("/api/password/forgot")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      message: "Silakan tunggu 30 menit sebelum meminta ulang link reset password",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceForgotPassword as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/password/forgot")
      .send({ email: "john@test.com" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
