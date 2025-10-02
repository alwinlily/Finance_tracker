import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { description, type, categories } = body

    if (!description || !categories || categories.length === 0) {
      return NextResponse.json(
        { error: "Description and categories required" },
        { status: 400 }
      )
    }

    // Choose AI model based on availability
    let model = null
    if (process.env.ANTHROPIC_API_KEY) {
      model = anthropic("claude-3-haiku-20240307")
    } else if (process.env.OPENAI_API_KEY) {
      model = openai("gpt-3.5-turbo")
    } else {
      return NextResponse.json(
        { error: "No AI provider configured" },
        { status: 503 }
      )
    }

    const categoryList = categories
      .map((c: any) => `${c.id}: ${c.name}`)
      .join("\n")

    const prompt = `Given this transaction description: "${description}" (type: ${type})

Available categories:
${categoryList}

Respond with ONLY the category ID that best matches this transaction. If none match well, respond with "none".`

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 50,
    })

    const categoryId = text.trim()
    const matchedCategory = categories.find((c: any) => c.id === categoryId)

    return NextResponse.json({
      categoryId: matchedCategory ? categoryId : null,
    })
  } catch (error) {
    console.error("AI categorization error:", error)
    return NextResponse.json(
      { error: "Failed to categorize" },
      { status: 500 }
    )
  }
}
