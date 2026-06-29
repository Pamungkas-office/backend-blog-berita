import { serviceGetPostById } from "../getPostById";
import { CustomError } from "../../../../lib/custom-error";
import { db } from "../../../../lib/db/db";

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    query: {
      posts: {
        findFirst: jest.fn(),
      },
    },
  };
  return { db: mockDb };
});

describe("SERVICE: serviceGetPostById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SUCCESS: should return post when found", async () => {
    const mockPost = { id: 1, title: "Test Post", slug: "test-post" };
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);

    const result = await serviceGetPostById(1);
    expect(result).toEqual(mockPost);
  });

  it("ERROR: should throw 404 when post not found", async () => {
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(undefined);

    await expect(serviceGetPostById(999))
      .rejects
      .toThrow(new CustomError("Post tidak ditemukan", 404));
  });
});
