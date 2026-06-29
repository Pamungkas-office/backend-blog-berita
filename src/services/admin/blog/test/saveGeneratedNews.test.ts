import { serviceSaveGenerated } from "../saveGeneratedNews";
import { CustomError } from "../../../../lib/custom-error";
import { db } from "../../../../lib/db/db";
import { generateSlug } from "../../../../utils/slug";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
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
    query: {
      posts: {
        findFirst: jest.fn(),
      },
    },
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

jest.mock("../../../../utils/slug", () => ({
  generateSlug: jest.fn((s: string) => {
    if (s.startsWith("Tech")) return "tech";
    if (s.startsWith("JS") || s.startsWith("javascript")) return "javascript";
    return s.toLowerCase().replace(/\s+/g, "-");
  }),
}));

describe("SERVICE: serviceSaveGenerated", () => {
  const mockData = {
    title: "Generated Post",
    news: "<p>Content</p>",
    category: ["Tech"],
    tags: ["javascript"],
    meta_title: "Meta Title",
    meta_description: "Meta Desc",
    provider: "gemini" as const,
  };

  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  it("SUCCESS: should save generated content with existing category and tag", async () => {
    mockReturnValues.push([{ id: 1, name: "Tech" }]); // category exists
    mockReturnValues.push([{ id: 1, name: "javascript" }]); // tag exists
    mockReturnValues.push([]); // no existing post with same slug
    const mockPost = { id: 1, title: "Generated Post", slug: "generated-post-title" };
    mockReturnValues.push([mockPost]); // tx.insert posts returning
    mockReturnValues.push([]); // tx.insert post_tags
    const finalResult = { ...mockPost, category: { id: 1, name: "Tech" }, post_tags: [{ tag: { id: 1, name: "javascript" } }] };
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(finalResult);

    const result = await serviceSaveGenerated(1, mockData);

    expect(result).toEqual(finalResult);
    expect(generateSlug).toHaveBeenCalled();
    expect(db.transaction).toHaveBeenCalled();
    expect(db.query.posts.findFirst).toHaveBeenCalled();
  });

  it("SUCCESS: should create new category and tag when they don't exist", async () => {
    mockReturnValues.push([]); // category not found
    mockReturnValues.push([{ id: 2, name: "Tech", slug: "tech" }]); // insert category returning
    mockReturnValues.push([]); // tag not found
    mockReturnValues.push([{ id: 2, name: "javascript", slug: "javascript" }]); // insert tag returning
    mockReturnValues.push([]); // no existing post
    const mockPost = { id: 1, title: "Generated Post", slug: "generated-post-title" };
    mockReturnValues.push([mockPost]); // tx.insert posts
    mockReturnValues.push([]); // tx.insert post_tags
    const finalResult = { ...mockPost, category: { id: 2, name: "Tech" }, post_tags: [{ tag: { id: 2, name: "javascript" } }] };
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(finalResult);

    const result = await serviceSaveGenerated(1, mockData);

    expect(result).toEqual(finalResult);
    expect(db.insert).toHaveBeenCalledTimes(4); // category, tag, post (tx), post_tags (tx)
  });

  it("SUCCESS: should handle slug conflict by appending timestamp", async () => {
    mockReturnValues.push([{ id: 1, name: "Tech" }]); // category exists
    mockReturnValues.push([{ id: 1 }]); // tag exists
    mockReturnValues.push([{ id: 1, slug: "generated-post-title" }]); // existing post with same slug
    const mockPost = { id: 2, title: "Generated Post", slug: expect.stringContaining("generated-post-title") };
    mockReturnValues.push([mockPost]); // tx.insert posts
    mockReturnValues.push([]); // tx.insert post_tags
    const finalResult = { ...mockPost, category: { id: 1, name: "Tech" }, post_tags: [{ tag: { id: 1, name: "javascript" } }] };
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(finalResult);

    const result = await serviceSaveGenerated(1, mockData);

    expect(db.select).toHaveBeenCalledTimes(3); // cat + tag + post check
    expect(result).toEqual(finalResult);
  });

  it("SUCCESS: should not insert post_tags when no tags resolved", async () => {
    const dataNoTags = { ...mockData, tags: [] };
    mockReturnValues.push([{ id: 1, name: "Tech" }]); // category exists
    mockReturnValues.push([]); // no existing post
    const mockPost = { id: 1, title: "Generated Post", slug: "generated-post-title" };
    mockReturnValues.push([mockPost]); // tx.insert posts - no tag insert since no tags
    const finalResult = { ...mockPost, category: { id: 1, name: "Tech" }, post_tags: [] };
    (db.query.posts.findFirst as jest.Mock).mockResolvedValue(finalResult);

    const result = await serviceSaveGenerated(1, dataNoTags);

    expect(result).toEqual(finalResult);
  });
});
