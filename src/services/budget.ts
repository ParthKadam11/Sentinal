import { db } from "../db/client.js";
import { requestLogs } from "../db/schema.js";

export const DAILY_BUDGET_USD = 1;

export async function canSpendToday() {
  const logs = await db.select().from(requestLogs);
  const today = new Date().toISOString().split("T")[0];
  const todaySpend = logs
    .filter((log) => {
      const logDate = log.createdAt.toISOString().split("T")[0];
      return logDate === today;
    })
    .reduce((sum, log) => sum + (log.estimatedCost ?? 0), 0);

    return {
        allowed: todaySpend < DAILY_BUDGET_USD,
        todaySpend: Number(todaySpend.toFixed(8)),
        remainingBudget: Number(
            Math.max(
                0,
                DAILY_BUDGET_USD - todaySpend
            ).toFixed(8)
        ),
    }

}
