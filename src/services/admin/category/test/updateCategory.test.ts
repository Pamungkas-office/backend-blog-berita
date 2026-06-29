import { serviceUpdateCategory } from "../updateCategory";
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

describe("SERVICE: serviceUpdateCategory", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should update and return category when id exists and slug is unique", async () => {
    const mockCategory = { id: 1, name: "Teknologi Update", slug: "teknologi-update" };
    mockReturnValues.push([{ id: 1, name: "Teknologi", slug: "teknologi" }]); // select by id - found
    mockReturnValues.push([]); // select by slug - no duplicate
    mockReturnValues.push([mockCategory]); // update returning

    const result = await serviceUpdateCategory(1, "Teknologi Update", "teknologi-update");

    expect(result).toEqual(mockCategory);
    expect(db.update).toHaveBeenCalled();
    expect(db.set).toHaveBeenCalledWith({ name: "Teknologi Update", slug: "teknologi-update" });
  });

  it("SUCCESS: should allow update when slug belongs to the same category", async () => {
    const mockCategory = { id: 1, name: "Teknologi", slug: "teknologi" };
    mockReturnValues.push([{ id: 1, name: "Old", slug: "old-slug" }]); // select by id - found
    mockReturnValues.push([{ id: 1, name: "Teknologi", slug: "teknologi" }]); // select by slug - same id
    mockReturnValues.push([mockCategory]); // update returning

    const result = await serviceUpdateCategory(1, "Teknologi", "teknologi");

    expect(result).toEqual(mockCategory);
  });

  it("ERROR: should throw 404 when category does not exist", async () => {
    mockReturnValues.push([]); // select by id - not found

    await expect(serviceUpdateCategory(999, "Nonexistent", "nonexistent"))
      .rejects
      .toThrow(new CustomError("Kategori tidak ditemukan", 404));
  });

  it("ERROR: should throw 409 when slug already belongs to another category", async () => {
    mockReturnValues.push([{ id: 1, name: "Existing", slug: "existing" }]); // select by id - found
    mockReturnValues.push([{ id: 2, name: "Other", slug: "taken-slug" }]); // select by slug - duplicate (different id)

    await expect(serviceUpdateCategory(1, "Updated", "taken-slug"))
      .rejects
      .toThrow(new CustomError("Slug kategori sudah digunakan", 409));
  });

  it("ERROR: should propagate unexpected database errors", async () => {
    mockReturnValues.push(Promise.reject(new Error("DB error")));

    await expect(serviceUpdateCategory(1, "Name", "slug"))
      .rejects
      .toThrow("DB error");
  });
});
