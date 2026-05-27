import { Hono } from "hono";
import {  generateGroqResponse } from "../services/providers/groq.js";
const chatRoute=new Hono()

chatRoute.post("/",async (c)=>{
    const body = await c.req.json()
    const message = body.message

    const result = await generateGroqResponse(message)

    return c.json(result)
})

export default chatRoute