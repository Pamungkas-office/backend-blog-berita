import { serviceLogin } from "../login";
import { CustomError } from "../../../lib/custom-error";
import { db } from "../../../lib/db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("SERVICE: serviceLogin", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should login and return token + user", async () => {
    const mockUser = {
      id: 1, name: "User", email: "user@test.com", role: "user",
      password: "hashed-pass", email_verified_at: "2024-01-01",
      created_at: "2024-01-01",
    };
    mockReturnValues.push([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

    const result = await serviceLogin("user@test.com", "password");

    expect(result).toEqual({
      token: "fake-jwt-token",
      user: { id: 1, name: "User", email: "user@test.com", role: "user" },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashed-pass");
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "1", email: "user@test.com", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any },
    );
  });

  it("ERROR: should throw 401 when email not registered", async () => {
    mockReturnValues.push([]);

    await expect(serviceLogin("unknown@test.com", "pass"))
      .rejects
      .toThrow(new CustomError("Email tidak terdaftar", 401));
  });

  it("ERROR: should throw 401 when password is wrong", async () => {
    mockReturnValues.push([{ id: 1, password: "hashed", email_verified_at: "2024-01-01" }]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(serviceLogin("user@test.com", "wrong"))
      .rejects
      .toThrow(new CustomError("Password tidak ditemukan", 401));
  });

  it("ERROR: should throw 403 when email not verified", async () => {
    mockReturnValues.push([{ id: 1, password: "hashed", email_verified_at: null }]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(serviceLogin("user@test.com", "pass"))
      .rejects
      .toThrow(new CustomError("Email belum diverifikasi. Silakan cek email Anda.", 403));
  });
});
