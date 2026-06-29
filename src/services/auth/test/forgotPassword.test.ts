import { serviceForgotPassword } from "../forgotPassword";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import crypto from "node:crypto";
import { sendResetPasswordEmail } from "../../email/emailService";

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

jest.mock("node:crypto", () => ({
  randomBytes: jest.fn(() => ({ toString: () => "raw-reset-token" })),
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => "hashed-reset-token"),
    })),
  })),
}));

jest.mock("../../email/emailService", () => ({
  sendResetPasswordEmail: jest.fn(),
}));

describe("SERVICE: serviceForgotPassword", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should send reset email and return true", async () => {
    mockReturnValues.push([{ id: 1 }]); // user found
    mockReturnValues.push([]); // no recent token
    (sendResetPasswordEmail as jest.Mock).mockResolvedValue(undefined);
    mockReturnValues.push([]); // tx.delete
    mockReturnValues.push([]); // tx.insert

    const result = await serviceForgotPassword("user@test.com");

    expect(result).toBe(true);
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(sendResetPasswordEmail).toHaveBeenCalledWith("user@test.com", "raw-reset-token");
    expect(db.transaction).toHaveBeenCalled();
  });

  it("SUCCESS: should return false when email not registered", async () => {
    mockReturnValues.push([]); // user not found

    const result = await serviceForgotPassword("unknown@test.com");

    expect(result).toBe(false);
    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 429 when recent token exists (rate limit)", async () => {
    mockReturnValues.push([{ id: 1 }]); // user found
    mockReturnValues.push([{ createdAt: "2024-01-01" }]); // recent token

    await expect(serviceForgotPassword("user@test.com"))
      .rejects
      .toThrow(new CustomError("Silakan tunggu 30 menit sebelum meminta ulang link reset password", 429));

    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 500 when email sending fails", async () => {
    mockReturnValues.push([{ id: 1 }]); // user found
    mockReturnValues.push([]); // no recent token
    (sendResetPasswordEmail as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    await expect(serviceForgotPassword("user@test.com"))
      .rejects
      .toThrow(new CustomError("Gagal mengirim email. Silakan coba lagi.", 500));

    expect(db.transaction).not.toHaveBeenCalled();
  });
});
