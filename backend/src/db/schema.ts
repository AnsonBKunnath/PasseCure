import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name'),
  encrypass: varchar('encrypass'),
});
        