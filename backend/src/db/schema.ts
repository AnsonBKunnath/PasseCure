import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const list = pgTable('securelist', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name'),
  encrypwd: varchar('encrypwd'),
});
        