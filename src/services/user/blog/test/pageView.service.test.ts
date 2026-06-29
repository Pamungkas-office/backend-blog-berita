import { recordPageView, getViewCount, getTotalViews, getViewsPerPost, getPostIdBySlug } from "../pageView.service";
import { db } from "../../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    select: jest.fn(() => mockDb),
    from: jest.fn(() => mockDb),
    where: jest.fn(() => mockDb),
    limit: jest.fn(() => mockDb),
    insert: jest.fn(() => mockDb),
    values: jest.fn(() => mockDb),
    update: jest.fn(() => mockDb),
    set: jest.fn(() => mockDb),
    groupBy: jest.fn(() => mockDb),
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: pageView.service", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  describe("recordPageView", () => {
    it("SUCCESS: should insert page view for visitor without userId", async () => {
      mockReturnValues.push([]); // existing check - no existing
      mockReturnValues.push([]); // insert (no return value needed)

      await recordPageView({ postId: 1, visitorId: "visitor-1" });

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith({ post_id: 1, visitor_id: "visitor-1" });
    });

    it("SUCCESS: should not insert duplicate view for same visitor", async () => {
      mockReturnValues.push([{ id: 1 }]); // existing check - found

      await recordPageView({ postId: 1, visitorId: "visitor-1" });

      expect(db.insert).not.toHaveBeenCalled();
    });

    it("SUCCESS: should skip view if user already viewed", async () => {
      mockReturnValues.push([{ id: 1 }]); // byUser check - found

      await recordPageView({ postId: 1, userId: 1, visitorId: "visitor-1" });

      expect(db.insert).not.toHaveBeenCalled();
    });

    it("SUCCESS: should link visitor record to user when found", async () => {
      mockReturnValues.push([]); // byUser - not found
      mockReturnValues.push([{ id: 5 }]); // byVisitor - found
      mockReturnValues.push([]); // update (no return)

      await recordPageView({ postId: 1, userId: 1, visitorId: "visitor-1" });

      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith({ user_id: 1 });
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("SUCCESS: should insert new view for user when no prior records", async () => {
      mockReturnValues.push([]); // byUser - not found
      mockReturnValues.push([]); // byVisitor - not found
      mockReturnValues.push([]); // insert

      await recordPageView({ postId: 1, userId: 1, visitorId: "visitor-1" });

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith({ post_id: 1, user_id: 1, visitor_id: "visitor-1" });
    });
  });

  describe("getViewCount", () => {
    it("SUCCESS: should return view count", async () => {
      mockReturnValues.push([{ count: 42 }]);

      const result = await getViewCount(1);
      expect(result).toBe(42);
    });

    it("SUCCESS: should return 0 when no views", async () => {
      mockReturnValues.push([{ count: null }]);

      const result = await getViewCount(1);
      expect(result).toBe(0);
    });
  });

  describe("getTotalViews", () => {
    it("SUCCESS: should return total views across all posts", async () => {
      mockReturnValues.push([{ count: 100 }]);

      const result = await getTotalViews();
      expect(result).toBe(100);
    });
  });

  describe("getViewsPerPost", () => {
    it("SUCCESS: should return view counts per post", async () => {
      const mockRows = [
        { postId: 1, count: 10 },
        { postId: 2, count: 20 },
      ];
      mockReturnValues.push(mockRows);

      const result = await getViewsPerPost([1, 2]);

      expect(result).toEqual({ 1: 10, 2: 20 });
    });

    it("SUCCESS: should return empty object for empty postIds", async () => {
      const result = await getViewsPerPost([]);
      expect(result).toEqual({});
      expect(db.select).not.toHaveBeenCalled();
    });

    it("SUCCESS: should return empty object when no rows found", async () => {
      mockReturnValues.push([]);

      const result = await getViewsPerPost([1, 2]);
      expect(result).toEqual({});
    });
  });

  describe("getPostIdBySlug", () => {
    it("SUCCESS: should return post id when found", async () => {
      mockReturnValues.push([{ id: 1 }]);

      const result = await getPostIdBySlug("test-post");
      expect(result).toBe(1);
    });

    it("SUCCESS: should return null when post not found", async () => {
      mockReturnValues.push([]);

      const result = await getPostIdBySlug("unknown");
      expect(result).toBeNull();
    });
  });
});
