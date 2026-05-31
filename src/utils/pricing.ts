import { MODEL_PRICE } from "./modelPricing.js"

type ModelName = keyof typeof MODEL_PRICE

function isModelName(model:string): model is ModelName{
  return model in MODEL_PRICE
}

export function calculateCost(
  model:string,
  promptTokens: number,
  completionTokens: number
) {
  if (!isModelName(model)) {
    return null
  }
  const pricing = MODEL_PRICE[model]
  
  if (!pricing) {
    return null
  }

  const inputCost =
    (promptTokens / 1_000_000) * pricing.input

  const outputCost =
    (completionTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}