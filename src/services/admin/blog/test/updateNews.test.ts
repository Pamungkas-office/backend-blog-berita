import { serviceUpdatePost } from "../updateNews";
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
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: serviceUpdatePost", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should update post title only", async () => {
    const mockExisting = { id: 1, title: "Old Title", slug: "old-title" };
    const mockUpdated = { id: 1, title: "New Title", slug: "old-title" };
    mockReturnValues.push([mockExisting]);
    mockReturnValues.push([mockUpdated]);

    const result = await serviceUpdatePost(1, { title: "New Title" });

    expect(result).toEqual(mockUpdated);
    expect(db.set).toHaveBeenCalledWith({ title: "New Title" });
  });

  it("SUCCESS: should update slug when unique", async () => {
    const mockExisting = { id: 1, title: "Post", slug: "old-slug" };
    const mockUpdated = { id: 1, title: "Post", slug: "new-slug" };
    mockReturnValues.push([mockExisting]);
    mockReturnValues.push([]); // slug check - no duplicate
    mockReturnValues.push([mockUpdated]);

    const result = await serviceUpdatePost(1, { slug: "new-slug" });

    expect(result).toEqual(mockUpdated);
    expect(db.set).toHaveBeenCalledWith({ slug: "new-slug" });
  });

  it("SUCCESS: should update tags when tag_ids provided", async () => {
    const mockExisting = { id: 1, title: "Post", slug: "post" };
    const mockUpdated = { id: 1, title: "Post", slug: "post" };
    mockReturnValues.push([mockExisting]);
    mockReturnValues.push([mockUpdated]); // update
    mockReturnValues.push([]); // delete post_tags
    mockReturnValues.push([]); // insert post_tags

    await serviceUpdatePost(1, { tag_ids: [1, 2] });

    expect(db.delete).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalled();
  });

  it("SUCCESS: should clear tags when tag_ids is empty array", async () => {
    const mockExisting = { id: 1, title: "Post", slug: "post" };
    const mockUpdated = { id: 1, title: "Post", slug: "post" };
    mockReturnValues.push([mockExisting]);
    mockReturnValues.push([mockUpdated]);
    mockReturnValues.push([]); // delete post_tags
    // no insert since tag_ids is empty

    await serviceUpdatePost(1, { tag_ids: [] });

    expect(db.delete).toHaveBeenCalled();
    expect(db.values).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 404 when post not found", async () => {
    mockReturnValues.push([]);

    await expect(serviceUpdatePost(999, { title: "New" }))
      .rejects
      .toThrow(new CustomError("Post tidak ditemukan", 404));
  });

  it("ERROR: should throw 409 when new slug already used by another post", async () => {
    mockReturnValues.push([{ id: 1, slug: "old-slug" }]);
    mockReturnValues.push([{ id: 2 }]); // duplicate slug found (different post)

    await expect(serviceUpdatePost(1, { slug: "taken-slug" }))
      .rejects
      .toThrow(new CustomError("Slug post sudah digunakan", 409));

    expect(db.update).not.toHaveBeenCalled();
  });
});
