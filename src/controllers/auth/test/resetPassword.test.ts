import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { resetPassword } from "../resetPassword";
import { serviceResetPassword } from "../../../services/auth/resetPassword";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/resetPassword");

const app = express();
app.use(express.json());
app.post("/api/password/reset", resetPassword);

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

describe("CONTROLLER: POST /api/password/reset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when password is reset", async () => {
    (serviceResetPassword as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/password/reset")
      .send({ token: "valid-token", password: "newpassword123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Password berhasil direset.",
      data: null,
    });
    expect(serviceResetPassword).toHaveBeenCalledWith("valid-token", "newpassword123");
  });

  it("ERROR: should return 400 when token is missing", async () => {
    const response = await request(app)
      .post("/api/password/reset")
      .send({ password: "newpassword123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceResetPassword).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when password is too short", async () => {
    const response = await request(app)
      .post("/api/password/reset")
      .send({ token: "valid-token", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceResetPassword).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when token is invalid", async () => {
    (serviceResetPassword as jest.Mock).mockRejectedValue(
      new CustomError("Token tidak valid", 400),
    );

    const response = await request(app)
      .post("/api/password/reset")
      .send({ token: "invalid-token", password: "newpassword123" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Token tidak valid",
    });
  });

  it("ERROR: should return 400 when token is already used", async () => {
    (serviceResetPassword as jest.Mock).mockRejectedValue(
      new CustomError("Token sudah digunakan", 400),
    );

    const response = await request(app)
      .post("/api/password/reset")
      .send({ token: "used-token", password: "newpassword123" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Token sudah digunakan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceResetPassword as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/password/reset")
      .send({ token: "valid-token", password: "newpassword123" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
