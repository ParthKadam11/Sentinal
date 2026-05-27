import { Hono } from "hono";
import { generateChatResponse } from "../services/openai.js";

const chatRoute=new Hono()

chatRoute.post("/",async (c)=>{
    const body = await c.req.json()
    const message = body.message

    const result = await generateChatResponse(message)

    return c.json(result)
})

export default chatRoute