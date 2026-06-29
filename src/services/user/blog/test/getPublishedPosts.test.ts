import { serviceGetPublishedPosts } from "../getPublishedPosts";
import { db } from "../../../../lib/db/db";

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

describe("SERVICE: serviceGetPublishedPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return published posts", async () => {
    const mockPosts = [
      { id: 1, title: "Post 1", slug: "post-1", category: { id: 1, name: "Tech" }, author: { id: 1, name: "Admin" }, post_tags: [] },
    ];
    (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

    const result = await serviceGetPublishedPosts();

    expect(result).toEqual(mockPosts);
    expect(db.query.posts.findMany).toHaveBeenCalled();
  });

  it("SUCCESS: should return empty array when no published posts", async () => {
    (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);

    const result = await serviceGetPublishedPosts();

    expect(result).toEqual([]);
  });
});
