import { serviceCreateComment } from "../createComment";
import { CustomError } from "../../../../lib/custom-error";
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
    returning: jest.fn(() => mockDb),
    update: jest.fn(() => mockDb),
    set: jest.fn(() => mockDb),
    delete: jest.fn(() => mockDb),
    orderBy: jest.fn(() => mockDb),
    query: {
      posts: {
        findFirst: jest.fn(),
      },
    },
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: serviceCreateComment", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should create and return comment", async () => {
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue({ id: 1, slug: "test-post" });
    const mockComment = { id: 1, post_id: 1, user_id: 1, comment: "Great article!" };
    mockReturnValues.push([mockComment]);

    const result = await serviceCreateComment(1, "test-post", "Great article!");

    expect(result).toEqual(mockComment);
    expect(db.query.posts.findFirst).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({
      post_id: 1,
      user_id: 1,
      comment: "Great article!",
    });
  });

  it("ERROR: should throw 404 when post slug not found", async () => {
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(undefined);

    await expect(serviceCreateComment(1, "unknown-slug", "Comment"))
      .rejects
      .toThrow(new CustomError("Postingan tidak ditemukan", 404));

    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when comment is empty", async () => {
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

    await expect(serviceCreateComment(1, "test-post", ""))
      .rejects
      .toThrow(new CustomError("Komentar tidak boleh kosong", 400));

    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when insert returns empty", async () => {
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    mockReturnValues.push([]);

    await expect(serviceCreateComment(1, "test-post", "Comment"))
      .rejects
      .toThrow(new CustomError("Gagal memberikan komentar, pastikan login terlebih dahulu", 400));
  });
});
