import { Hono } from "hono"
import { db } from "../db/client.js"
import { requestLogs } from "../db/schema.js"

const analyticsRoute = new Hono()

analyticsRoute.get("/analytics", async (c) => {
    try {
        const logs = await db.select().from(requestLogs)
        return c.json(logs ?? [])
    } catch (err) {
        console.error("Failed to fetch analytics logs:", err)
        return c.json({ error: "Failed to fetch analytics" }, 500)
    }
})

export default analyticsRoute