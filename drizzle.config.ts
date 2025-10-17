import { defineConfig } from "drizzle-kit";

// Enhanced config with better MySQL compatibility
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "mysql://root@localhost:3306/drisya",
  },
  verbose: true,
  strict: false,
});
