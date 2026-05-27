import OpenAi from "openai"

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

    const res = await client.chat.completions.create({
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
    return{
        content:res.choices[0].message.content,
        usage:res.usage,
        model:res.model,
        latency,
        provider:'groq'
    }
}