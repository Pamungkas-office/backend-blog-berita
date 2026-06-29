import { serviceResendVerification } from "../resendVerification";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import crypto from "node:crypto";
import { sendVerificationEmail } from "../../email/emailService";

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
  randomBytes: jest.fn(() => ({ toString: () => "raw-verification-token" })),
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => "hashed-verification-token"),
    })),
  })),
}));

jest.mock("../../email/emailService", () => ({
  sendVerificationEmail: jest.fn(),
}));

describe("SERVICE: serviceResendVerification", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should resend verification email when token is expired", async () => {
    const mockUser = {
      id: 1,
      email_verified_at: null,
      email_verification_expires_at: new Date(Date.now() - 86400000).toISOString(), // expired
    };
    mockReturnValues.push([mockUser]);
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
    mockReturnValues.push([]); // update (no return)

    await serviceResendVerification("user@test.com");

    expect(sendVerificationEmail).toHaveBeenCalledWith("user@test.com", "raw-verification-token");
    expect(db.set).toHaveBeenCalledWith({
      email_verification_token: "hashed-verification-token",
      email_verification_expires_at: expect.any(String),
    });
  });

  it("SUCCESS: should silently return when email not found", async () => {
    mockReturnValues.push([]);

    await serviceResendVerification("unknown@test.com");

    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 400 when email already verified", async () => {
    mockReturnValues.push([{ id: 1, email_verified_at: "2024-01-01", email_verification_expires_at: null }]);

    await expect(serviceResendVerification("verified@test.com"))
      .rejects
      .toThrow(new CustomError("Email sudah diverifikasi", 400));

    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 429 when previous token still valid", async () => {
    const mockUser = {
      id: 1,
      email_verified_at: null,
      email_verification_expires_at: new Date(Date.now() + 86400000).toISOString(), // still valid
    };
    mockReturnValues.push([mockUser]);

    await expect(serviceResendVerification("user@test.com"))
      .rejects
      .toThrow(new CustomError(
        "Link verifikasi sebelumnya masih berlaku. Silakan cek email Anda.",
        429,
      ));

    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 500 when email sending fails", async () => {
    const mockUser = {
      id: 1,
      email_verified_at: null,
      email_verification_expires_at: new Date(Date.now() - 86400000).toISOString(),
    };
    mockReturnValues.push([mockUser]);
    (sendVerificationEmail as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    await expect(serviceResendVerification("user@test.com"))
      .rejects
      .toThrow(new CustomError("Gagal mengirim email verifikasi. Silakan coba lagi.", 500));

    expect(db.update).not.toHaveBeenCalled();
  });
});
