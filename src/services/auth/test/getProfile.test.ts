import { serviceGetProfile } from "../getProfile";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../lib/db/db", () => {
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

describe("SERVICE: serviceGetProfile", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should return user profile when found", async () => {
    const mockUser = { id: 1, name: "User", email: "user@test.com", role: "user", email_verified_at: null, created_at: "2024-01-01" };
    mockReturnValues.push([mockUser]);

    const result = await serviceGetProfile("1");

    expect(result).toEqual(mockUser);
  });

  it("ERROR: should throw 404 when user not found", async () => {
    mockReturnValues.push([]);

    await expect(serviceGetProfile("999"))
      .rejects
      .toThrow(new CustomError("User tidak ditemukan", 404));
  });
});
