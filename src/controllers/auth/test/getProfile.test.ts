import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../lib/custom-error";
import { getProfile } from "../getProfile";
import { serviceGetProfile } from "../../../services/auth/getProfile";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/auth/getProfile");

const app = express();
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = { id: "1", email: "john@test.com", role: "user" };
  next();
});
app.get("/api/auth/profile", getProfile);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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

describe("CONTROLLER: GET /api/auth/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with profile data", async () => {
    const mockProfile = { id: 1, name: "John Doe", email: "john@test.com", role: "user", email_verified_at: null, created_at: "2024-01-01" };
    (serviceGetProfile as jest.Mock).mockResolvedValue(mockProfile);

    const response = await request(app).get("/api/auth/profile");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Profile berhasil diambil",
      data: mockProfile,
    });
    expect(serviceGetProfile).toHaveBeenCalledWith("1");
  });

  it("ERROR: should return 404 when user is not found", async () => {
    (serviceGetProfile as jest.Mock).mockRejectedValue(
      new CustomError("User tidak ditemukan", 404),
    );

    const response = await request(app).get("/api/auth/profile");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "User tidak ditemukan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceGetProfile as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/auth/profile");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
