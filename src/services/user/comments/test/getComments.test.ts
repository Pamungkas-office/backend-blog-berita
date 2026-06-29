import { serviceGetComments } from "../getComments";
import { db } from "../../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    select: jest.fn(() => mockDb),
    from: jest.fn(() => mockDb),
    innerJoin: jest.fn(() => mockDb),
    leftJoin: jest.fn(() => mockDb),
    where: jest.fn(() => mockDb),
    orderBy: jest.fn(() => mockDb),
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

describe("SERVICE: serviceGetComments", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should return comments for a post slug", async () => {
    const mockComments = [
      { id: 1, comment: "Great!", created_at: "2024-01-02", post_id: 1, user: { id: 1, name: "User" } },
    ];
    mockReturnValues.push(mockComments);

    const result = await serviceGetComments("test-post");

    expect(result).toEqual(mockComments);
    expect(db.where).toHaveBeenCalled();
    expect(db.orderBy).toHaveBeenCalled();
    expect(db.limit).toHaveBeenCalledWith(10);
  });

  it("SUCCESS: should return empty array when no comments", async () => {
    mockReturnValues.push([]);

    const result = await serviceGetComments("no-comments");

    expect(result).toEqual([]);
  });
});
