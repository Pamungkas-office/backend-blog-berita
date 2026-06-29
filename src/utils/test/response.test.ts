import { sendSuccess } from "../response";
import type { Response } from "express";

describe("UTIL: sendSuccess", () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("should send success response with defaults", () => {
    sendSuccess(mockRes as Response, { id: 1 });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
      data: { id: 1 },
    });
  });

  it("should send success response with custom message and status", () => {
    sendSuccess(mockRes as Response, null, "Created", 201);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Created",
      data: null,
    });
  });
});
