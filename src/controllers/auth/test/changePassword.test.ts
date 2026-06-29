import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { changePassword } from "../changePassword";
import { serviceChangePassword } from "../../../services/auth/changePassword";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/changePassword");
jest.mock("../../../services/email/emailService");

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "john@test.com", role: "user" };
  next();
});
app.post("/api/auth/change-password", changePassword);

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

describe("CONTROLLER: POST /api/auth/change-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when password is changed", async () => {
    (serviceChangePassword as jest.Mock).mockResolvedValue({
      email: "john@test.com",
      name: "John Doe",
    });

    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ currentPassword: "oldpass123", newPassword: "newpass12345" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Password berhasil diubah",
      data: null,
    });
    expect(serviceChangePassword).toHaveBeenCalledWith("1", "oldpass123", "newpass12345");
  });

  it("ERROR: should return 400 when currentPassword is missing", async () => {
    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ newPassword: "newpass12345" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceChangePassword).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when newPassword is too short", async () => {
    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ currentPassword: "oldpass123", newPassword: "short" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceChangePassword).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when current password is wrong", async () => {
    (serviceChangePassword as jest.Mock).mockRejectedValue(
      new CustomError("Password saat ini tidak cocok", 400),
    );

    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ currentPassword: "wrongpass", newPassword: "newpass12345" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Password saat ini tidak cocok",
    });
  });

  it("ERROR: should return 404 when user is not found", async () => {
    (serviceChangePassword as jest.Mock).mockRejectedValue(
      new CustomError("User tidak ditemukan", 404),
    );

    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ currentPassword: "oldpass123", newPassword: "newpass12345" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "User tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceChangePassword as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/auth/change-password")
      .send({ currentPassword: "oldpass123", newPassword: "newpass12345" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
