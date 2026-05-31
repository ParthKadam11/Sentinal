    import OpenAi from "openai"
    import { db } from "../../db/client.js"
    import { requestLogs } from "../../db/schema.js"
import { calculateCost } from "../../utils/pricing.js"

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set. Add it to a .env file or your shell environment')
    }

    const client = new OpenAi({
        apiKey,
        baseURL:"https://api.groq.com/openai/v1",
    })

    export async function generateGroqResponse(message: string) {
        const start = Date.now()

        const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
            role: "user",
            content: message,
            },
        ],
        max_completion_tokens: 100,
        temperature: 0.2,
        })
        const latency = Date.now() - start
        try{
        // log if missing to inspect real response shape
        if (!response.usage) console.warn('generateGroqResponse: response.usage missing', response)

        const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 } as any
        const promptTokens = usage.prompt_tokens ?? 0
        const completionTokens = usage.completion_tokens ?? 0
        const totalTokens = promptTokens + completionTokens
        const estimatedCost = calculateCost(
            response.model,
            promptTokens,
            completionTokens)

        await db.insert(requestLogs).values({
            provider: "groq",
            model: response.model,
            queueTime: usage.queue_time,
            promptTokens,
            completionTokens,
            totalTokens,
            latency,
            estimatedCost
        })
        } catch(err){
            console.log("failed to save telemetry",err)
        }


        return{
            content:response.choices[0].message.content,
            usage:response.usage,
            model:response.model,
            latency,
            provider:'groq',
        }
    }