import { Hono } from "hono";
import { generateResponse } from "../services/providers/index.js";
import { canSpendToday } from "../services/budget.js";

const chatRoute=new Hono()

chatRoute.post("/",async (c)=>{
    const body = await c.req.json()
    const {provider,message}= body
    const budget = await canSpendToday()

    if (!budget.allowed) {
        return c.json(
            {
                error: "Daily budget exceeded",
                todaySpend: budget.todaySpend,
                remainingBudget:
                    budget.remainingBudget,
            },
            403
        )
    }
    
    const result = await generateResponse(provider,message);

    return c.json(result)
})

export default chatRoute