import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../../../../lib/custom-error";
import { createTag } from "../createTag";
import { serviceCreateTag } from "../../../../services/admin/tag/createTag";

jest.mock("../../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../../services/admin/tag/createTag");

const app = express();
app.use(express.json());
app.post("/api/admin/tags", createTag);

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

describe("CONTROLLER: POST /api/admin/tags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return 201 with tag data when body is valid", async () => {
    const mockTag = { id: 1, name: "JavaScript", slug: "javascript" };
    (serviceCreateTag as jest.Mock).mockResolvedValue(mockTag);

    const response = await request(app)
      .post("/api/admin/tags")
      .send({ name: "JavaScript", slug: "javascript" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Tag berhasil dibuat",
      data: mockTag,
    });
    expect(serviceCreateTag).toHaveBeenCalledWith("JavaScript", "javascript");
  });

  it("ERROR: should return 400 when name is missing", async () => {
    const response = await request(app)
      .post("/api/admin/tags")
      .send({ slug: "javascript" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when slug is missing", async () => {
    const response = await request(app)
      .post("/api/admin/tags")
      .send({ name: "JavaScript" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 400 when body is empty", async () => {
    const response = await request(app)
      .post("/api/admin/tags")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validasi gagal");
    expect(serviceCreateTag).not.toHaveBeenCalled();
  });

  it("ERROR: should return 409 when slug already exists", async () => {
    (serviceCreateTag as jest.Mock).mockRejectedValue(
      new CustomError("Slug tag sudah digunakan", 409),
    );

    const response = await request(app)
      .post("/api/admin/tags")
      .send({ name: "JavaScript", slug: "javascript" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      message: "Slug tag sudah digunakan",
    });
    expect(serviceCreateTag).toHaveBeenCalledWith("JavaScript", "javascript");
  });

  it("ERROR: should return 500 when service throws unexpected error", async () => {
    (serviceCreateTag as jest.Mock).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/admin/tags")
      .send({ name: "JavaScript", slug: "javascript" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
  });
});
