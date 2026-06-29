import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { updateTag } from "../updateTag";
import { serviceUpdateTag } from "../../../../services/admin/tag/updateTag";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/tag/updateTag");

const app = express();
app.use(express.json());
app.put("/api/admin/tags/:id", updateTag);

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

describe("CONTROLLER: PUT /api/admin/tags/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 200 with updated tag data when body and id are valid", async () => {
    const mockTag = { id: 1, name: "JavaScript Update", slug: "javascript-update" };
    (serviceUpdateTag as jest.Mock).mockResolvedValue(mockTag);

    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({ name: "JavaScript Update", slug: "javascript-update" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Tag berhasil diperbarui",
      data: mockTag,
    });
    expect(serviceUpdateTag).toHaveBeenCalledWith(1, "JavaScript Update", "javascript-update");
  });

  it("ERROR: should return 400 when name is missing", async () => {
    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({ slug: "javascript-update" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when slug is missing", async () => {
    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({ name: "JavaScript Update" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceUpdateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 404 when tag does not exist", async () => {
    (serviceUpdateTag as jest.Mock).mockRejectedValue(
      new CustomError("Tag tidak ditemukan", 404),
    );

    const response = await request(app)
      .put("/api/admin/tags/999")
      .send({ name: "Nonexistent", slug: "nonexistent" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Tag tidak ditemukan",
    });
    expect(serviceUpdateTag).toHaveBeenCalledWith(999, "Nonexistent", "nonexistent");
  });

  it("ERROR: should return 409 when slug already belongs to another tag", async () => {
    (serviceUpdateTag as jest.Mock).mockRejectedValue(
      new CustomError("Slug tag sudah digunakan", 409),
    );

    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({ name: "JavaScript", slug: "sudah-dipakai" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Slug tag sudah digunakan",
    });
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceUpdateTag as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/admin/tags/1")
      .send({ name: "JavaScript", slug: "javascript" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
