import { defineConfig } from "drizzle-kit";

// Enhanced config with better MySQL compatibility
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "drisya",
  },
  verbose: true,
  strict: false,
});
