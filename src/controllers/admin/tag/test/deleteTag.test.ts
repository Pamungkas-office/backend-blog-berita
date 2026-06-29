import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { deleteTag } from "../deleteTag";
import { serviceDeleteTag } from "../../../../services/admin/tag/deleteTag";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/tag/deleteTag");

const app = express();
app.use(express.json());
app.delete("/api/admin/tags/:id", deleteTag);

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

describe("CONTROLLER: DELETE /api/admin/tags/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 when tag is deleted", async () => {
    (serviceDeleteTag as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete("/api/admin/tags/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Tag berhasil dihapus",
      data: null,
    });
    expect(serviceDeleteTag).toHaveBeenCalledWith(1);
  });

  it("ERROR: should return 404 when tag does not exist", async () => {
    (serviceDeleteTag as jest.Mock).mockRejectedValue(
      new CustomError("Tag tidak ditemukan", 404),
    );

    const response = await request(app).delete("/api/admin/tags/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Tag tidak ditemukan",
    });
    expect(serviceDeleteTag).toHaveBeenCalledWith(999);
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceDeleteTag as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app).delete("/api/admin/tags/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
