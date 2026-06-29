import { serviceDeletePost } from "../deleteNews";
import { CustomError } from "../../../../lib/custom-error";
import { db } from "../../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    select: jest.fn(() => mockDb),
    from: jest.fn(() => mockDb),
    where: jest.fn(() => mockDb),
    limit: jest.fn(() => mockDb),
    delete: jest.fn(() => mockDb),
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: serviceDeletePost", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should delete post when id exists", async () => {
    mockReturnValues.push([{ id: 1 }]);
    mockReturnValues.push([]);

    await serviceDeletePost(1);
    expect(db.delete).toHaveBeenCalled();
  });

  it("ERROR: should throw 404 when post not found", async () => {
    mockReturnValues.push([]);

    await expect(serviceDeletePost(999))
      .rejects
      .toThrow(new CustomError("Post tidak ditemukan", 404));

    expect(db.delete).not.toHaveBeenCalled();
  });
});
