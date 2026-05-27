import { error } from "console"
import { generateGroqResponse } from "./groq.js"
import { generateOpenAIResponse } from "./openai.js"

const providers = {
  groq: generateGroqResponse,
  openai: generateOpenAIResponse,
}



export async function generateResponse(
    provider:keyof typeof providers,
    message:string) {
    const selectedProvider= providers[provider]

    if(!selectedProvider){
        throw new Error("Invalid Provider!!")
    }

    return selectedProvider(message)
}