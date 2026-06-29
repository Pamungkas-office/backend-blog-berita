import { serviceGetPostBySlug } from "../getPostBySlug";
import { CustomError } from "../../../../lib/custom-error";
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

describe("SERVICE: serviceGetPostBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return post when found", async () => {
    const mockPost = { id: 1, title: "Post 1", slug: "post-1", category: { id: 1, name: "Tech" }, author: { id: 1, name: "Admin" }, post_tags: [] };
    (db.query.posts.findMany as jest.Mock).mockResolvedValue([mockPost]);

    const result = await serviceGetPostBySlug("post-1");

    expect(result).toEqual(mockPost);
  });

  it("ERROR: should throw 404 when post not found", async () => {
    (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);

    await expect(serviceGetPostBySlug("unknown-slug"))
      .rejects
      .toThrow(new CustomError("Post tidak ditemukan", 404));
  });
});
