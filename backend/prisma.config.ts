import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Schema generation and typechecking do not need a database connection.
// Migration commands still require DATABASE_URL in the local .env file.
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
