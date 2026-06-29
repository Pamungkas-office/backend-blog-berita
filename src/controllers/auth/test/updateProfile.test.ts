import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../lib/custom-error";
import { updateProfile } from "../updateProfile";
import { serviceUpdateProfile } from "../../../services/auth/updateProfile";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/updateProfile");

const app = express();
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "john@test.com", role: "user" };
  next();
});
app.put("/api/auth/profile", updateProfile);

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

describe("CONTROLLER: PUT /api/auth/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with updated profile data", async () => {
    const mockProfile = { id: 1, name: "John Updated", email: "john@test.com", role: "user", created_at: "2024-01-01" };
    (serviceUpdateProfile as jest.Mock).mockResolvedValue(mockProfile);

    const response = await request(app)
      .put("/api/auth/profile")
      .send({ name: "John Updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Profile berhasil diperbarui",
      data: mockProfile,
    });
    expect(serviceUpdateProfile).toHaveBeenCalledWith("1", "John Updated", undefined);
  });

  it("SUCCESS: should update email only when name is not provided", async () => {
    const mockProfile = { id: 1, name: "John Doe", email: "newemail@test.com", role: "user", created_at: "2024-01-01" };
    (serviceUpdateProfile as jest.Mock).mockResolvedValue(mockProfile);

    const response = await request(app)
      .put("/api/auth/profile")
      .send({ email: "newemail@test.com" });

    expect(response.status).toBe(200);
    expect(serviceUpdateProfile).toHaveBeenCalledWith("1", undefined, "newemail@test.com");
  });

  it("ERROR: should return 400 when name is too short", async () => {
    const response = await request(app)
      .put("/api/auth/profile")
      .send({ name: "AB" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateProfile).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when email is invalid", async () => {
    const response = await request(app)
      .put("/api/auth/profile")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateProfile).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when email is already used by another user", async () => {
    (serviceUpdateProfile as jest.Mock).mockRejectedValue(
      new CustomError("Email sudah digunakan user lain", 409),
    );

    const response = await request(app)
      .put("/api/auth/profile")
      .send({ email: "taken@test.com" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Email sudah digunakan user lain",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceUpdateProfile as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/auth/profile")
      .send({ name: "John Doe" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
