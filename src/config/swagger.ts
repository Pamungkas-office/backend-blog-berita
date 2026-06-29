import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Blog Berita API",
    version: "1.0.0",
    description:
      "API documentation for Blog Berita application. " +
      "This API provides endpoints for managing news articles, categories, tags, comments, advertisements, and user authentication.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
    {
      url: "https://backend-blog-berita.vercel.app",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication endpoints (register, login, logout, profile)" },
    { name: "Password", description: "Password management endpoints (forgot, reset)" },
    { name: "Blog Public", description: "Public blog post endpoints" },
    { name: "Categories", description: "Public category endpoints" },
    { name: "Tags", description: "Public tag endpoints" },
    { name: "Ad Positions", description: "Public advertisement endpoints" },
    { name: "Comments", description: "User comment endpoints (CRUD)" },
    { name: "Admin Blog", description: "Admin blog post management" },
    { name: "Admin Categories", description: "Admin category management" },
    { name: "Admin Tags", description: "Admin tag management" },
    { name: "Admin Comments", description: "Admin comment management" },
    { name: "Admin Ad Positions", description: "Admin advertisement management" },
    { name: "Admin Stats", description: "Admin statistics endpoints" },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
