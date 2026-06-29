import request from "supertest";
import express, { type NextFunction, type Request, type Response } from "express";
import { getTotalViewsStats } from "../stats.controller";
import { getTotalViews } from "../../../services/user/blog/pageView.service";

jest.mock("../../../lib/db/db", () => ({ db: {} }));
jest.mock("../../../services/user/blog/pageView.service");

const app = express();
app.get("/api/admin/stats/total-views", getTotalViewsStats);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

describe("CONTROLLER: GET /api/admin/stats/total-views", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("SUCCESS: should return 200 with total views", async () => {
    (getTotalViews as jest.Mock).mockResolvedValue(5000);

    const response = await request(app).get("/api/admin/stats/total-views");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true, message: "Total views fetched", data: { total_views: 5000 },
    });
  });

  it("ERROR: should return 500 when service throws", async () => {
    (getTotalViews as jest.Mock).mockRejectedValue(new Error("DB error"));
    const response = await request(app).get("/api/admin/stats/total-views");
    expect(response.status).toBe(500);
  });
});
