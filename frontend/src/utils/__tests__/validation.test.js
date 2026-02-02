import {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateRegisterForm,
  validateAddress,
  sanitizeInput,
} from "@/utils/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("accepts valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name+tag@example.co.uk")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("accepts valid passwords", () => {
      expect(validatePassword("Password123")).toBe(true);
      expect(validatePassword("MyP@ssw0rd")).toBe(true);
    });

    it("rejects passwords shorter than 8 characters", () => {
      expect(validatePassword("Pass1")).toBe(false);
    });

    it("rejects passwords without uppercase", () => {
      expect(validatePassword("password123")).toBe(false);
    });

    it("rejects passwords without lowercase", () => {
      expect(validatePassword("PASSWORD123")).toBe(false);
    });

    it("rejects passwords without numbers", () => {
      expect(validatePassword("PasswordABC")).toBe(false);
    });
  });

  describe("validateLoginForm", () => {
    it("returns null for valid credentials", () => {
      expect(validateLoginForm("test@example.com", "Password123")).toBeNull();
    });

    it("returns errors for invalid email", () => {
      const errors = validateLoginForm("invalid", "Password123");
      expect(errors).toHaveProperty("email");
    });

    it("returns errors for invalid password", () => {
      const errors = validateLoginForm("test@example.com", "short");
      expect(errors).toHaveProperty("password");
    });
  });

  describe("validateRegisterForm", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      phone: "1234567890",
    };

    it("returns null for valid registration data", () => {
      expect(validateRegisterForm(validData)).toBeNull();
    });

    it("validates name length", () => {
      const errors = validateRegisterForm({ ...validData, name: "A" });
      expect(errors).toHaveProperty("name");
    });

    it("validates password match", () => {
      const errors = validateRegisterForm({
        ...validData,
        confirmPassword: "DifferentPassword123",
      });
      expect(errors).toHaveProperty("confirmPassword");
    });

    it("validates phone number format", () => {
      const errors = validateRegisterForm({ ...validData, phone: "123" });
      expect(errors).toHaveProperty("phone");
    });
  });

  describe("sanitizeInput", () => {
    it("removes HTML tags", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe("");
      expect(sanitizeInput("Hello <b>World</b>")).toBe("Hello World");
    });

    it("trims whitespace", () => {
      expect(sanitizeInput("  test  ")).toBe("test");
    });

    it("handles empty input", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput(null)).toBe("");
    });
  });
});
