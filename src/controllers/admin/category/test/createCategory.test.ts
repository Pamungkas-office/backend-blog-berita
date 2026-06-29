import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { createCategory } from "../createCategory";
import { serviceCreateCategory } from "../../../../services/admin/category/createCategory";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/category/createCategory");

const app = express();
app.use(express.json());
app.post("/api/admin/categories", createCategory);

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

describe("CONTROLLER: POST /api/admin/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with category data when body is valid", async () => {
    const mockCategory = { id: 1, name: "Teknologi", slug: "teknologi" };
    (serviceCreateCategory as jest.Mock).mockResolvedValue(mockCategory);

    const response = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Teknologi", slug: "teknologi" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Kategori berhasil dibuat",
      data: mockCategory,
    });
    expect(serviceCreateCategory).toHaveBeenCalledWith("Teknologi", "teknologi");
  });

  it("ERROR: should return 400 when name is missing", async () => {
    const response = await request(app)
      .post("/api/admin/categories")
      .send({ slug: "teknologi" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when slug is missing", async () => {
    const response = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Teknologi" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .post("/api/admin/categories")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when slug already exists", async () => {
    (serviceCreateCategory as jest.Mock).mockRejectedValue(
      new CustomError("Slug kategori sudah digunakan", 409),
    );

    const response = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Teknologi", slug: "teknologi" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Slug kategori sudah digunakan",
    });
    expect(serviceCreateCategory).toHaveBeenCalledWith("Teknologi", "teknologi");
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceCreateCategory as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/admin/categories")
      .send({ name: "Teknologi", slug: "teknologi" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
