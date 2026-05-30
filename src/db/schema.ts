import { text,pgTable,integer,real,timestamp,serial } from "drizzle-orm/pg-core";

export const requestLogs = pgTable("requestLogs",{
    id:serial("id").primaryKey(),
    provider:text("provider").notNull(),
    model:text("model").notNull(),
    promptTokens: integer("prompt_tokens").notNull(),
    completionTokens: integer("completion_tokens").notNull(),
    totalTokens: integer("total_tokens").notNull(),
    latency: integer("latency").notNull(),
    queueTime: real("queue_time"),
    estimatedCost: real("estimated_cost"),
    createdAt: timestamp("created_at",{mode:"date"})
    .defaultNow()
    .notNull(),
})
