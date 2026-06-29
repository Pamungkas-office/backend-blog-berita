import { serviceChangePassword } from "../changePassword";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import bcrypt from "bcryptjs";

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

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("SERVICE: serviceChangePassword", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should change password when current password is correct", async () => {
    const mockUser = { password: "hashed-old", email: "user@test.com", name: "User" };
    mockReturnValues.push([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-new");

    const result = await serviceChangePassword("1", "old-pass", "new-pass");

    expect(result).toEqual({ email: "user@test.com", name: "User" });
    expect(bcrypt.compare).toHaveBeenCalledWith("old-pass", "hashed-old");
    expect(bcrypt.hash).toHaveBeenCalledWith("new-pass", 12);
    expect(db.set).toHaveBeenCalledWith({ password: "hashed-new" });
  });

  it("ERROR: should throw 404 when user not found", async () => {
    mockReturnValues.push([]);

    await expect(serviceChangePassword("999", "pass", "new-pass"))
      .rejects
      .toThrow(new CustomError("User tidak ditemukan", 404));
  });

  it("ERROR: should throw 400 when current password is incorrect", async () => {
    mockReturnValues.push([{ password: "hashed", email: "u@t.com", name: "U" }]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(serviceChangePassword("1", "wrong", "new-pass"))
      .rejects
      .toThrow(new CustomError("Password saat ini tidak cocok", 400));

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});
