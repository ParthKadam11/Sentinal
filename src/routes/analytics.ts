import { Hono } from "hono"
import { db } from "../db/client.js"
import { requestLogs } from "../db/schema.js"

const analyticsRoute = new Hono()

analyticsRoute.get("/", async (c) => {
    try {
        const logs = await db.select().from(requestLogs)
        const totalRequests = logs.length   
        const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens,0)
        const averageLatency = logs.length > 0 ? logs.reduce((sum, log) => sum + log.latency, 0) / logs.length: 0

    return c.json({
        totalRequests,
        totalTokens,
        averageLatency: Number(averageLatency.toFixed(2)),
    })
    } 
    
    catch (err) {
        console.error("Failed to fetch analytics logs:", err)
        return c.json({ error: "Failed to fetch analytics" }, 500)
    }
})

analyticsRoute.get("/recent", async (c) => {
    try {
        const logs = await db.select().from(requestLogs)

        return c.json(logs)
    } catch (err) {
        console.error(err)

        return c.json(
            { error: "Failed to fetch recent logs" },
            500
        )
    }
})

export default analyticsRoute