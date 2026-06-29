import { serviceCreatePost } from "../createNews";
import { CustomError } from "../../../../lib/custom-error";
import { db } from "../../../../lib/db/db";
import { MediaService } from "../../../../lib/upload";

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
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

jest.mock("../../../../lib/upload", () => ({
  MediaService: { uploadThumbnail: jest.fn() },
}));

describe("SERVICE: serviceCreatePost", () => {
  const baseData = {
    title: "New Post",
    slug: "new-post",
    content: "<p>Content</p>",
    category_id: 1,
    status: "draft" as const,
  };

  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should create post without file or tags", async () => {
    mockReturnValues.push([]); // slug check - no duplicate
    mockReturnValues.push([{ id: 1 }]); // category exists
    (MediaService.uploadThumbnail as jest.Mock).mockResolvedValue(null);
    const mockPost = { id: 1, ...baseData, thumbnail: null, user_id: 1 };
    mockReturnValues.push([mockPost]); // insert returning

    const result = await serviceCreatePost(1, baseData, undefined);

    expect(result).toEqual(mockPost);
    expect(MediaService.uploadThumbnail).toHaveBeenCalledWith(undefined);
  });

  it("SUCCESS: should create post with file and tags", async () => {
    mockReturnValues.push([]); // slug check
    mockReturnValues.push([{ id: 1 }]); // category exists
    (MediaService.uploadThumbnail as jest.Mock).mockResolvedValue("https://thumb.url");
    const mockPost = { id: 1, ...baseData, thumbnail: "https://thumb.url", user_id: 1 };
    mockReturnValues.push([mockPost]); // insert returning
    mockReturnValues.push([]); // insert post_tags (no value needed)

    const file = { buffer: Buffer.from("test"), mimetype: "image/jpeg" } as Express.Multer.File;
    const result = await serviceCreatePost(1, { ...baseData, tag_ids: [1, 2] }, file);

    expect(result).toEqual(mockPost);
    expect(MediaService.uploadThumbnail).toHaveBeenCalledWith(file);
    expect(db.values).toHaveBeenCalledTimes(2); // post + post_tags
  });

  it("ERROR: should throw 409 when slug already exists", async () => {
    mockReturnValues.push([{ id: 1 }]); // slug duplicate

    await expect(serviceCreatePost(1, baseData, undefined))
      .rejects
      .toThrow(new CustomError("Slug post sudah digunakan", 409));

    expect(MediaService.uploadThumbnail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 404 when category not found", async () => {
    mockReturnValues.push([]); // slug check ok
    mockReturnValues.push([]); // category not found

    await expect(serviceCreatePost(1, baseData, undefined))
      .rejects
      .toThrow(new CustomError("Kategori tidak ditemukan", 404));

    expect(MediaService.uploadThumbnail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });
});
