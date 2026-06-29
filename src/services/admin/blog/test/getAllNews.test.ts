import { getAllNewsAdmin } from "../getAllNews";
import { db } from "../../../../lib/db/db";
import { getViewsPerPost } from "../../../user/blog/pageView.service";

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    query: {
      posts: {
        findMany: jest.fn(),
      },
    },
  };
  return { db: mockDb };
});

jest.mock("../../../user/blog/pageView.service", () => ({
  getViewsPerPost: jest.fn(),
}));

describe("SERVICE: getAllNewsAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return all posts with view counts", async () => {
    const mockPosts = [
      { id: 1, title: "Post 1", slug: "post-1", category: { id: 1, name: "Tech" }, author: { id: 1, name: "Admin", email: "admin@test.com" }, post_tags: [] },
      { id: 2, title: "Post 2", slug: "post-2", category: { id: 1, name: "Tech" }, author: { id: 1, name: "Admin", email: "admin@test.com" }, post_tags: [{ tag: { id: 1, name: "JS" } }] },
    ];
    (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);
    (getViewsPerPost as jest.Mock).mockResolvedValue({ 1: 100, 2: 50 });

    const result = await getAllNewsAdmin();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ ...mockPosts[0], view_count: 100 });
    expect(result[1]).toEqual({ ...mockPosts[1], view_count: 50 });
    expect(db.query.posts.findMany).toHaveBeenCalled();
    expect(getViewsPerPost).toHaveBeenCalledWith([1, 2]);
  });

  it("SUCCESS: should return empty array when no posts exist", async () => {
    (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);
    (getViewsPerPost as jest.Mock).mockResolvedValue({});

    const result = await getAllNewsAdmin();

    expect(result).toEqual([]);
  });
});
