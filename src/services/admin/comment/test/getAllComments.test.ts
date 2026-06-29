import { serviceGetAllComments } from "../getAllComments";
import { db } from "../../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    select: jest.fn(() => mockDb),
    from: jest.fn(() => mockDb),
    where: jest.fn(() => mockDb),
    limit: jest.fn(() => mockDb),
    offset: jest.fn(() => mockDb),
    leftJoin: jest.fn(() => mockDb),
    orderBy: jest.fn(() => mockDb),
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

describe("SERVICE: serviceGetAllComments", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should return paginated comments", async () => {
    const mockComments = [
      { id: 1, comment: "Nice post", created_at: "2024-01-02", post: { id: 1, title: "Post 1", slug: "post-1" }, user: { id: 1, name: "User" } },
    ];
    mockReturnValues.push([{ total: 1 }]); // count
    mockReturnValues.push(mockComments); // data

    const result = await serviceGetAllComments(1, 10);

    expect(result).toEqual({
      data: mockComments,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it("SUCCESS: should return empty paginated response when no comments", async () => {
    mockReturnValues.push([{ total: 0 }]);
    mockReturnValues.push([]);

    const result = await serviceGetAllComments(1, 10);

    expect(result).toEqual({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it("SUCCESS: should calculate totalPages correctly", async () => {
    mockReturnValues.push([{ total: 25 }]);
    mockReturnValues.push([]);

    const result = await serviceGetAllComments(1, 10);

    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });
});
