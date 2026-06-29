import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { deleteCategory } from "../deleteCategory";
import { serviceDeleteCategory } from "../../../../services/admin/category/deleteCategory";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/category/deleteCategory");

const app = express();
app.use(express.json());
app.delete("/api/admin/categories/:id", deleteCategory);

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

describe("CONTROLLER: DELETE /api/admin/categories/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when category is deleted", async () => {
    (serviceDeleteCategory as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete("/api/admin/categories/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Kategori berhasil dihapus",
      data: null,
    });
    expect(serviceDeleteCategory).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 404 when category does not exist", async () => {
    (serviceDeleteCategory as jest.Mock).mockRejectedValue(
      new CustomError("Kategori tidak ditemukan", 404),
    );

    const response = await request(app).delete("/api/admin/categories/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Kategori tidak ditemukan",
    });
    expect(serviceDeleteCategory).toHaveBeenCalledWith(999);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceDeleteCategory as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).delete("/api/admin/categories/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
