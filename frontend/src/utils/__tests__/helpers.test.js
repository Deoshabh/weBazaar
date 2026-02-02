import {
  formatPrice,
  formatDate,
  generateSlug,
  truncateText,
  calculateDiscount,
  isValidIndianPhone,
} from "@/utils/helpers";

describe("Helper Utilities", () => {
  describe("formatPrice", () => {
    it("formats numbers with Indian comma notation", () => {
      expect(formatPrice(1000)).toBe("₹1,000");
      expect(formatPrice(100000)).toBe("₹1,00,000");
      expect(formatPrice(10000000)).toBe("₹1,00,00,000");
    });

    it("handles decimal values", () => {
      expect(formatPrice(1999.99)).toBe("₹2,000");
    });

    it("handles zero and negative values", () => {
      expect(formatPrice(0)).toBe("₹0");
      expect(formatPrice(-100)).toBe("₹-100");
    });
  });

  describe("formatDate", () => {
    it("formats date correctly", () => {
      const date = new Date("2026-02-03T10:30:00");
      const formatted = formatDate(date);
      expect(formatted).toContain("Feb");
      expect(formatted).toContain("2026");
    });

    it("handles string dates", () => {
      const formatted = formatDate("2026-02-03");
      expect(formatted).toBeTruthy();
    });
  });

  describe("generateSlug", () => {
    it("converts text to URL-friendly slug", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
      expect(generateSlug("React Testing Library")).toBe(
        "react-testing-library",
      );
    });

    it("handles special characters", () => {
      expect(generateSlug("Men's Shoes")).toBe("mens-shoes");
      expect(generateSlug("Price: $100")).toBe("price-100");
    });

    it("removes extra spaces and hyphens", () => {
      expect(generateSlug("  extra   spaces  ")).toBe("extra-spaces");
      expect(generateSlug("multiple---hyphens")).toBe("multiple-hyphens");
    });
  });

  describe("truncateText", () => {
    it("truncates long text", () => {
      const longText = "This is a very long text that needs to be truncated";
      expect(truncateText(longText, 20)).toBe("This is a very long...");
    });

    it("keeps short text unchanged", () => {
      expect(truncateText("Short text", 20)).toBe("Short text");
    });

    it("handles empty text", () => {
      expect(truncateText("", 10)).toBe("");
    });
  });

  describe("calculateDiscount", () => {
    it("calculates discount percentage", () => {
      expect(calculateDiscount(100, 80)).toBe(20);
      expect(calculateDiscount(1000, 750)).toBe(25);
    });

    it("returns 0 for no discount", () => {
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it("handles invalid values", () => {
      expect(calculateDiscount(0, 50)).toBe(0);
      expect(calculateDiscount(100, 0)).toBe(100);
    });
  });

  describe("isValidIndianPhone", () => {
    it("validates correct Indian phone numbers", () => {
      expect(isValidIndianPhone("9876543210")).toBe(true);
      expect(isValidIndianPhone("8123456789")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isValidIndianPhone("123456789")).toBe(false);
      expect(isValidIndianPhone("12345678901")).toBe(false);
      expect(isValidIndianPhone("abcdefghij")).toBe(false);
    });
  });
});
