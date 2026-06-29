import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { login } from "../login";
import { serviceLogin } from "../../../services/auth/login";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/login");

const app = express();
app.use(express.json());
app.post("/api/auth/login", login);

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

describe("CONTROLLER: POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with token and user data, and set auth_token cookie", async () => {
    const mockResult = {
      token: "jwt-token-here",
      user: { id: 1, name: "John Doe", email: "john@test.com", role: "user" },
    };
    (serviceLogin as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@test.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Login berhasil",
      data: mockResult,
    });
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toContain("auth_token");
    expect(serviceLogin).toHaveBeenCalledWith("john@test.com", "password123");
  });

  it("ERROR: should return 400 when email is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "invalid", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceLogin).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when password is empty", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@test.com", password: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceLogin).not.toHaveBeenCalled();
  });

  it("ERROR: should return 401 when email is not registered", async () => {
    (serviceLogin as jest.Mock).mockRejectedValue(
      new CustomError("Email tidak terdaftar", 401),
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@test.com", password: "password123" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Email tidak terdaftar",
    });
  });

  it("ERROR: should return 401 when password is wrong", async () => {
    (serviceLogin as jest.Mock).mockRejectedValue(
      new CustomError("Password tidak ditemukan", 401),
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@test.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Password tidak ditemukan",
    });
  });

  it("ERROR: should return 403 when email not verified", async () => {
    (serviceLogin as jest.Mock).mockRejectedValue(
      new CustomError("Email belum diverifikasi. Silakan cek email Anda.", 403),
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@test.com", password: "password123" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: "Email belum diverifikasi. Silakan cek email Anda.",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceLogin as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@test.com", password: "password123" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
