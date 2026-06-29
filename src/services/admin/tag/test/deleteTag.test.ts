import { serviceDeleteTag } from "../deleteTag";
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

describe("SERVICE: serviceDeleteTag", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should delete tag when id exists", async () => {
    mockReturnValues.push([{ id: 1, name: "JavaScript", slug: "javascript" }]);

    await serviceDeleteTag(1);

    expect(db.delete).toHaveBeenCalled();
  });

  it("ERROR: should throw 404 when tag does not exist", async () => {
    mockReturnValues.push([]);

    await expect(serviceDeleteTag(999))
      .rejects
      .toThrow(new CustomError("Tag tidak ditemukan", 404));

    expect(db.delete).not.toHaveBeenCalled();
  });
});
