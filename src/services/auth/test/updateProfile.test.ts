import { serviceUpdateProfile } from "../updateProfile";
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

describe("SERVICE: serviceUpdateProfile", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should update name only", async () => {
    const mockUser = { id: 1, name: "New Name", email: "user@test.com", role: "user", created_at: "2024-01-01" };
    mockReturnValues.push([mockUser]);

    const result = await serviceUpdateProfile("1", "New Name");

    expect(result).toEqual(mockUser);
    expect(db.set).toHaveBeenCalledWith({ name: "New Name" });
  });

  it("SUCCESS: should update email when unique", async () => {
    const mockUser = { id: 1, name: "User", email: "new@test.com", role: "user", created_at: "2024-01-01" };
    mockReturnValues.push([]); // email check - no duplicate
    mockReturnValues.push([mockUser]);

    const result = await serviceUpdateProfile("1", undefined, "new@test.com");

    expect(result).toEqual(mockUser);
    expect(db.set).toHaveBeenCalledWith({ email: "new@test.com" });
  });

  it("SUCCESS: should update both name and email", async () => {
    const mockUser = { id: 1, name: "New Name", email: "new@test.com", role: "user", created_at: "2024-01-01" };
    mockReturnValues.push([]); // email check
    mockReturnValues.push([mockUser]);

    const result = await serviceUpdateProfile("1", "New Name", "new@test.com");

    expect(result).toEqual(mockUser);
    expect(db.set).toHaveBeenCalledWith({ name: "New Name", email: "new@test.com" });
  });

  it("SUCCESS: should allow email update when email belongs to same user", async () => {
    const mockUser = { id: 1, name: "User", email: "same@test.com", role: "user", created_at: "2024-01-01" };
    mockReturnValues.push([{ id: 1 }]); // email check - found but same user
    mockReturnValues.push([mockUser]);

    const result = await serviceUpdateProfile("1", "User", "same@test.com");

    expect(result).toEqual(mockUser);
  });

  it("ERROR: should throw 409 when email already used by another user", async () => {
    mockReturnValues.push([{ id: 2 }]); // email check - found, different user

    await expect(serviceUpdateProfile("1", "User", "taken@test.com"))
      .rejects
      .toThrow(new CustomError("Email sudah digunakan user lain", 409));

    expect(db.update).not.toHaveBeenCalled();
  });
});
