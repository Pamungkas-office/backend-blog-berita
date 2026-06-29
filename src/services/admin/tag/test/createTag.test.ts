import { serviceCreateTag } from "../createTag";
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

describe("SERVICE: serviceCreateTag", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should create and return tag when slug is unique", async () => {
    const mockTag = { id: 1, name: "JavaScript", slug: "javascript" };
    mockReturnValues.push([]);
    mockReturnValues.push([mockTag]);

    const result = await serviceCreateTag("JavaScript", "javascript");

    expect(result).toEqual(mockTag);
    expect(db.select).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({ name: "JavaScript", slug: "javascript" });
  });

  it("ERROR: should throw 409 when slug already exists", async () => {
    mockReturnValues.push([{ id: 1 }]);

    await expect(serviceCreateTag("JavaScript", "javascript"))
      .rejects
      .toThrow(new CustomError("Slug tag sudah digunakan", 409));

    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should propagate unexpected database errors", async () => {
    mockReturnValues.push([]);
    mockReturnValues.push(Promise.reject(new Error("DB connection failed")));

    await expect(serviceCreateTag("JavaScript", "javascript"))
      .rejects
      .toThrow("DB connection failed");
  });
});
