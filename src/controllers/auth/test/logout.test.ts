import request from "supertest";
import express from "express";
import { logout } from "../logout";

const app = express();
app.post("/api/auth/logout", logout);

describe("CONTROLLER: POST /api/auth/logout", () => {
  it("SUCCESS: should clear auth_token cookie and return 200", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Logout berhasil",
      data: null,
    });
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toContain("auth_token=;");
  });
});
