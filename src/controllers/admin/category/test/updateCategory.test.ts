import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { updateCategory } from "../updateCategory";
import { serviceUpdateCategory } from "../../../../services/admin/category/updateCategory";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/category/updateCategory");

const app = express();
app.use(express.json());
app.put("/api/admin/categories/:id", updateCategory);

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

describe("CONTROLLER: PUT /api/admin/categories/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with updated category data when body and id are valid", async () => {
    const mockCategory = { id: 1, name: "Teknologi Update", slug: "teknologi-update" };
    (serviceUpdateCategory as jest.Mock).mockResolvedValue(mockCategory);

    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({ name: "Teknologi Update", slug: "teknologi-update" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: mockCategory,
    });
    expect(serviceUpdateCategory).toHaveBeenCalledWith(1, "Teknologi Update", "teknologi-update");
  });

  it("ERROR: should return 400 when name is missing", async () => {
    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({ slug: "teknologi-update" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when slug is missing", async () => {
    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({ name: "Teknologi Update" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateCategory).not.toHaveBeenCalled();
  });

  it("ERROR: should return 404 when category does not exist", async () => {
    (serviceUpdateCategory as jest.Mock).mockRejectedValue(
      new CustomError("Kategori tidak ditemukan", 404),
    );

    const response = await request(app)
      .put("/api/admin/categories/999")
      .send({ name: "Nonexistent", slug: "nonexistent" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Kategori tidak ditemukan",
    });
    expect(serviceUpdateCategory).toHaveBeenCalledWith(999, "Nonexistent", "nonexistent");
  });

  it("ERROR: should return 409 when slug already belongs to another category", async () => {
    (serviceUpdateCategory as jest.Mock).mockRejectedValue(
      new CustomError("Slug kategori sudah digunakan", 409),
    );

    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({ name: "Teknologi", slug: "sudah-dipakai" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Slug kategori sudah digunakan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceUpdateCategory as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/admin/categories/1")
      .send({ name: "Teknologi", slug: "teknologi" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
