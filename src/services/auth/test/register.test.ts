import { serviceRegister } from "../register";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import bcrypt from "bcryptjs";
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

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

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

describe("SERVICE: serviceRegister", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should register user and send verification email", async () => {
    const mockUser = { id: 1, name: "New User", email: "new@test.com", role: "user", created_at: "2024-01-01" };
    mockReturnValues.push([]); // check existing - no duplicate
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
    mockReturnValues.push([mockUser]);

    const result = await serviceRegister("New User", "new@test.com", "password");

    expect(result).toEqual(mockUser);
    expect(bcrypt.hash).toHaveBeenCalledWith("password", 12);
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(crypto.createHash).toHaveBeenCalledWith("sha256");
    expect(sendVerificationEmail).toHaveBeenCalledWith("new@test.com", "raw-verification-token");
    expect(db.values).toHaveBeenCalledWith({
      name: "New User",
      email: "new@test.com",
      password: "hashed-password",
      email_verification_token: "hashed-verification-token",
      email_verification_expires_at: expect.any(String),
    });
  });

  it("ERROR: should throw 409 when email already exists", async () => {
    mockReturnValues.push([{ id: 1 }]);

    await expect(serviceRegister("User", "existing@test.com", "pass"))
      .rejects
      .toThrow(new CustomError("Email sudah terdaftar", 409));

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("ERROR: should throw 500 when email sending fails", async () => {
    mockReturnValues.push([]); // check existing - no duplicate
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (sendVerificationEmail as jest.Mock).mockRejectedValue(new Error("SMTP error"));

    await expect(serviceRegister("User", "new@test.com", "pass"))
      .rejects
      .toThrow(new CustomError("Gagal mengirim email verifikasi. Silakan coba lagi.", 500));

    expect(db.insert).not.toHaveBeenCalled();
  });
});
