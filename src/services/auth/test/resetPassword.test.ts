import { serviceResetPassword } from "../resetPassword";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

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
    transaction: jest.fn(async (cb: any) => cb(mockDb)),
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("node:crypto", () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => "hashed-reset-token"),
    })),
  })),
}));

describe("SERVICE: serviceResetPassword", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should reset password when token is valid", async () => {
    const future = new Date(Date.now() + 3600000).toISOString();
    mockReturnValues.push([{ email: "user@test.com", expiresAt: future, usedAt: null }]);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-new-password");
    mockReturnValues.push([]); // tx.update users
    mockReturnValues.push([]); // tx.update passwordResets

    await serviceResetPassword("raw-token", "new-password");

    expect(crypto.createHash).toHaveBeenCalledWith("sha256");
    expect(bcrypt.hash).toHaveBeenCalledWith("new-password", 12);
    expect(db.transaction).toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when token is invalid", async () => {
    mockReturnValues.push([]);

    await expect(serviceResetPassword("invalid-token", "pass"))
      .rejects
      .toThrow(new CustomError("Token tidak valid", 400));
  });

  it("ERROR: should throw 400 when token already used", async () => {
    const future = new Date(Date.now() + 3600000).toISOString();
    mockReturnValues.push([{ email: "u@t.com", expiresAt: future, usedAt: "2024-01-01" }]);

    await expect(serviceResetPassword("used-token", "pass"))
      .rejects
      .toThrow(new CustomError("Token sudah digunakan", 400));
  });

  it("ERROR: should throw 400 when token is expired", async () => {
    const past = new Date(Date.now() - 3600000).toISOString();
    mockReturnValues.push([{ email: "u@t.com", expiresAt: past, usedAt: null }]);

    await expect(serviceResetPassword("expired-token", "pass"))
      .rejects
      .toThrow(new CustomError("Token sudah kedaluwarsa", 400));
  });
});
