import { serviceCreateCategory } from "../createCategory";
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

describe("SERVICE: serviceCreateCategory", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should create and return category when slug is unique", async () => {
    const mockCategory = { id: 1, name: "Teknologi", slug: "teknologi" };
    mockReturnValues.push([]); // select - no existing
    mockReturnValues.push([mockCategory]); // insert returning

    const result = await serviceCreateCategory("Teknologi", "teknologi");

    expect(result).toEqual(mockCategory);
    expect(db.select).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({ name: "Teknologi", slug: "teknologi" });
  });

  it("ERROR: should throw 409 when slug already exists", async () => {
    mockReturnValues.push([{ id: 1 }]); // select - existing found

    await expect(serviceCreateCategory("Teknologi", "teknologi"))
      .rejects
      .toThrow(new CustomError("Slug kategori sudah digunakan", 409));

    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should propagate unexpected database errors", async () => {
    mockReturnValues.push([]); // select - no existing
    mockReturnValues.push(Promise.reject(new Error("DB connection failed")));

    await expect(serviceCreateCategory("Teknologi", "teknologi"))
      .rejects
      .toThrow("DB connection failed");
  });
});
