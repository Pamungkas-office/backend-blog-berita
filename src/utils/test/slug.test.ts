import { generateSlug } from "../slug";

describe("UTIL: generateSlug", () => {
  it("should slugify a simple title", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("should handle special characters", () => {
    expect(generateSlug("What is Node.js?")).toBe("what-is-nodejs");
  });

  it("should handle Indonesian characters", () => {
    const result = generateSlug("Berita Terkini Hari Ini");
    expect(result).toBe("berita-terkini-hari-ini");
  });

  it("should trim and lowercase", () => {
    expect(generateSlug("  UPPERCASE Title  ").trim()).not.toContain("  ");
    expect(generateSlug("UPPERCASE Title")).toBe("uppercase-title");
  });
});
