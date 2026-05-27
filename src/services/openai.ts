import OpenAi from "openai"

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Add it to a .env file or your shell environment')
}

const client = new OpenAi({
    apiKey,
})

export async function generateChatResponse(message: string) {
    const res = await client.chat.completions.create({
        model:"gpt-4.1-mini",
        messages:[
            {
                role:"user",
                content:message,
            }
        ]
    })

    return{
        content:res.choices[0].message.content,
        usage:res.usage,
        model:res.model
    }
}