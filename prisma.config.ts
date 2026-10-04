
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";
import { getEnvFile } from './src/utils/functions/function.js';

dotenv.config({ path: getEnvFile(process.env['NODE_ENV']) });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
