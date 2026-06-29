import { serviceVerifyEmail } from "../verifyEmail";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
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
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

jest.mock("node:crypto", () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => "hashed-verification-token"),
    })),
  })),
}));

describe("SERVICE: serviceVerifyEmail", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should verify email when token is valid", async () => {
    const mockUser = {
      id: 1,
      email_verified_at: null,
      email_verification_expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    mockReturnValues.push([mockUser]);
    mockReturnValues.push([]); // update (no return needed)

    await serviceVerifyEmail("raw-token");

    expect(crypto.createHash).toHaveBeenCalledWith("sha256");
    expect(db.set).toHaveBeenCalledWith({
      email_verified_at: expect.any(String),
      email_verification_token: null,
      email_verification_expires_at: null,
    });
  });

  it("ERROR: should throw 400 when token is invalid", async () => {
    mockReturnValues.push([]);

    await expect(serviceVerifyEmail("invalid-token"))
      .rejects
      .toThrow(new CustomError("Token verifikasi tidak valid", 400));
  });

  it("ERROR: should throw 400 when email already verified", async () => {
    mockReturnValues.push([{ id: 1, email_verified_at: "2024-01-01", email_verification_expires_at: null }]);

    await expect(serviceVerifyEmail("used-token"))
      .rejects
      .toThrow(new CustomError("Email sudah diverifikasi sebelumnya", 400));

    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when token is expired", async () => {
    mockReturnValues.push([{
      id: 1,
      email_verified_at: null,
      email_verification_expires_at: new Date(Date.now() - 86400000).toISOString(),
    }]);

    await expect(serviceVerifyEmail("expired-token"))
      .rejects
      .toThrow(new CustomError(
        "Token verifikasi sudah kedaluwarsa. Silakan minta link verifikasi baru.",
        400,
      ));

    expect(db.update).not.toHaveBeenCalled();
  });
});
