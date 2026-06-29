import { serviceUpdateComment } from "../updateComment";
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

describe("SERVICE: serviceUpdateComment", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should update and return comment when owner", async () => {
    const mockUpdated = { id: 1, comment: "Updated comment", user_id: 1, post_id: 1 };
    mockReturnValues.push([{ id: 1, user_id: 1 }]); // select - found, owned by user 1
    mockReturnValues.push([mockUpdated]); // update returning

    const result = await serviceUpdateComment(1, 1, "Updated comment");

    expect(result).toEqual(mockUpdated);
    expect(db.set).toHaveBeenCalledWith({ comment: "Updated comment" });
  });

  it("ERROR: should throw 404 when comment does not exist", async () => {
    mockReturnValues.push([]);

    await expect(serviceUpdateComment(999, 1, "Comment"))
      .rejects
      .toThrow(new CustomError("Komentar tidak ditemukan", 404));

    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 403 when user is not the owner", async () => {
    mockReturnValues.push([{ id: 1, user_id: 2 }]); // owned by user 2

    await expect(serviceUpdateComment(1, 1, "Comment"))
      .rejects
      .toThrow(new CustomError("Anda tidak memiliki akses untuk mengubah komentar ini", 403));

    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when comment text is empty", async () => {
    mockReturnValues.push([{ id: 1, user_id: 1 }]);

    await expect(serviceUpdateComment(1, 1, ""))
      .rejects
      .toThrow(new CustomError("Komentar tidak boleh kosong", 400));

    expect(db.update).not.toHaveBeenCalled();
  });
});
