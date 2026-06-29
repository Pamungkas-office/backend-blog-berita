import { sendEmail, sendResetPasswordEmail, sendVerificationEmail, sendPasswordChangedEmail } from "../emailService";
import nodemailer from "nodemailer";

const mockSendMail = jest.fn();
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

describe("SERVICE: emailService", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "user@test.com";
    process.env.SMTP_PASS = "password";
    process.env.SMTP_FROM = "noreply@test.com";
    process.env.FRONTEND_URL = "https://blog.test.com";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe("sendEmail", () => {
    it("SUCCESS: should send email via transporter", async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: "123" });

      await sendEmail({ to: "test@test.com", subject: "Test", html: "<p>Hi</p>" });

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.test.com",
        port: 587,
        secure: false,
        auth: { user: "user@test.com", pass: "password" },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
      });
      expect(mockSendMail).toHaveBeenCalledWith({
        from: "noreply@test.com",
        to: "test@test.com",
        subject: "Test",
        html: "<p>Hi</p>",
      });
    });

    it("ERROR: should throw when sendMail fails", async () => {
      mockSendMail.mockRejectedValueOnce(new Error("SMTP connection failed"));

      await expect(sendEmail({ to: "test@test.com", subject: "Test", html: "" }))
        .rejects
        .toThrow("SMTP connection failed");
    });
  });

  describe("sendResetPasswordEmail", () => {
    it("SUCCESS: should send reset password email with correct link", async () => {
      mockSendMail.mockResolvedValueOnce({});

      await sendResetPasswordEmail("user@test.com", "reset-token-123");

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Reset Password — Blog Berita",
          html: expect.stringContaining("reset-password?token=reset-token-123"),
        }),
      );
    });
  });

  describe("sendVerificationEmail", () => {
    it("SUCCESS: should send verification email with correct link", async () => {
      mockSendMail.mockResolvedValueOnce({});

      await sendVerificationEmail("user@test.com", "verify-token-456");

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Verifikasi Email — Blog Berita",
          html: expect.stringContaining("verify-email?token=verify-token-456"),
        }),
      );
    });
  });

  describe("sendPasswordChangedEmail", () => {
    it("SUCCESS: should send password changed notification", async () => {
      mockSendMail.mockResolvedValueOnce({});

      await sendPasswordChangedEmail("user@test.com", "User");

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Password Berhasil Diubah — Blog Berita",
          html: expect.stringContaining("User"),
        }),
      );
    });
  });
});
