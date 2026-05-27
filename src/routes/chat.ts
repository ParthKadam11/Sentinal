import { Hono } from "hono";
import { generateResponse } from "../services/providers/index.js";


const chatRoute=new Hono()

chatRoute.post("/",async (c)=>{
    const body = await c.req.json()
    const {provider,message}= body

    const result = await generateResponse(provider,message);

    return c.json(result)
})

export default chatRoute