import { serviceDeleteComment } from "../deleteComment";
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

describe("SERVICE: serviceDeleteComment (admin)", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should delete comment when id exists", async () => {
    mockReturnValues.push([{ id: 1 }]);
    mockReturnValues.push([]);

    await serviceDeleteComment(1);

    expect(db.delete).toHaveBeenCalled();
  });

  it("ERROR: should throw 404 when comment does not exist", async () => {
    mockReturnValues.push([]);

    await expect(serviceDeleteComment(999))
      .rejects
      .toThrow(new CustomError("Komentar tidak ditemukan", 404));

    expect(db.delete).not.toHaveBeenCalled();
  });
});
