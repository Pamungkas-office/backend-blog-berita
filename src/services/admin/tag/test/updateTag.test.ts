import { serviceUpdateTag } from "../updateTag";
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
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: serviceUpdateTag", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should update and return tag when id exists and slug is unique", async () => {
    const mockTag = { id: 1, name: "JS Update", slug: "js-update" };
    mockReturnValues.push([{ id: 1, name: "JS", slug: "js" }]);
    mockReturnValues.push([]);
    mockReturnValues.push([mockTag]);

    const result = await serviceUpdateTag(1, "JS Update", "js-update");

    expect(result).toEqual(mockTag);
    expect(db.update).toHaveBeenCalled();
    expect(db.set).toHaveBeenCalledWith({ name: "JS Update", slug: "js-update" });
  });

  it("SUCCESS: should allow update when slug belongs to the same tag", async () => {
    const mockTag = { id: 1, name: "JavaScript", slug: "javascript" };
    mockReturnValues.push([{ id: 1, name: "Old", slug: "old" }]);
    mockReturnValues.push([{ id: 1, name: "JavaScript", slug: "javascript" }]);
    mockReturnValues.push([mockTag]);

    const result = await serviceUpdateTag(1, "JavaScript", "javascript");
    expect(result).toEqual(mockTag);
  });

  it("ERROR: should throw 404 when tag does not exist", async () => {
    mockReturnValues.push([]);

    await expect(serviceUpdateTag(999, "Nonexistent", "nonexistent"))
      .rejects
      .toThrow(new CustomError("Tag tidak ditemukan", 404));
  });

  it("ERROR: should throw 409 when slug already belongs to another tag", async () => {
    mockReturnValues.push([{ id: 1, name: "Existing", slug: "existing" }]);
    mockReturnValues.push([{ id: 2, name: "Other", slug: "taken-slug" }]);

    await expect(serviceUpdateTag(1, "Updated", "taken-slug"))
      .rejects
      .toThrow(new CustomError("Slug tag sudah digunakan", 409));
  });

  it("ERROR: should propagate unexpected database errors", async () => {
    mockReturnValues.push(Promise.reject(new Error("DB error")));

    await expect(serviceUpdateTag(1, "Name", "slug"))
      .rejects
      .toThrow("DB error");
  });
});
