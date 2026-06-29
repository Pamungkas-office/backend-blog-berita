import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { register } from "../register";
import { serviceRegister } from "../../../services/auth/register";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/register");

const app = express();
app.use(express.json());
app.post("/api/auth/register", register);

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

describe("CONTROLLER: POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with user data when body is valid", async () => {
    const mockUser = { id: 1, name: "John Doe", email: "john@test.com", role: "user", created_at: "2024-01-01" };
    (serviceRegister as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "John Doe", email: "john@test.com", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Registrasi berhasil. Silakan cek email untuk verifikasi.",
      data: mockUser,
    });
    expect(serviceRegister).toHaveBeenCalledWith("John Doe", "john@test.com", "password123");
  });

  it("ERROR: should return 400 when name is too short", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jo", email: "john@test.com", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceRegister).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when email is invalid", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "John Doe", email: "invalid-email", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceRegister).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when password is too short", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "John Doe", email: "john@test.com", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceRegister).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when email already exists", async () => {
    (serviceRegister as jest.Mock).mockRejectedValue(
      new CustomError("Email sudah terdaftar", 409),
    );

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "John Doe", email: "existing@test.com", password: "password123" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Email sudah terdaftar",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceRegister as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "John Doe", email: "john@test.com", password: "password123" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
