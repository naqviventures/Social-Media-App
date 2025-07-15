import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"

// Enhanced fallback post creation
function createFallbackPost(account: any, index: number) {
  const industry = account.industry || "business"
  const name = account.name || "Business"
  const tone = account.tone || "professional"
  const useEmojis = account.use_emojis !== false

  const postTemplates = {
    healthcare: [
      {
        content: `${useEmojis ? "🏥 " : ""}Your health is our priority. At ${name}, we're committed to providing exceptional ${account.expertise || "healthcare"} services. ${useEmojis ? "💙" : ""} Ready to take the next step in your wellness journey?`,
        hashtags: [
          "healthcare",
          "wellness",
          "health",
          account.primary_location?.city?.toLowerCase().replace(/\s+/g, "") || "local",
          "patientcare",
        ],
        imagePrompt: `Modern healthcare facility interior with professional medical equipment, clean white and blue color scheme, natural lighting, welcoming atmosphere`,
      },
      {
        content: `${useEmojis ? "✨ " : ""}Did you know? Early intervention can make all the difference. Our team at ${name} specializes in ${account.expertise || "comprehensive care"} to help you feel your best.`,
        hashtags: ["healthtips", "prevention", "wellness", account.industry, "expertcare"],
        imagePrompt: `Professional healthcare consultation scene, doctor and patient discussion, modern medical office, warm lighting, trust and care atmosphere`,
      },
    ],
    technology: [
      {
        content: `${useEmojis ? "🚀 " : ""}Innovation never stops at ${name}! We're transforming ${account.industry} with cutting-edge ${account.expertise || "solutions"}. Ready to revolutionize your business?`,
        hashtags: [
          "innovation",
          "technology",
          "digital",
          "business",
          account.primary_location?.city?.toLowerCase().replace(/\s+/g, "") || "tech",
        ],
        imagePrompt: `Modern tech office with multiple monitors, coding screens, innovative workspace, blue and white color scheme, professional lighting`,
      },
      {
        content: `${useEmojis ? "💡 " : ""}The future is here! Our latest ${account.products || "technology solutions"} are helping businesses like yours stay ahead of the curve. Let's build something amazing together.`,
        hashtags: ["futuretech", "innovation", "business", "solutions", "growth"],
        imagePrompt: `Futuristic technology concept, digital interfaces, holographic displays, modern office environment, innovative atmosphere`,
      },
    ],
    default: [
      {
        content: `${useEmojis ? "⭐ " : ""}Excellence isn't just our goal—it's our standard. At ${name}, we're dedicated to delivering ${account.products || "exceptional service"} that exceeds your expectations.`,
        hashtags: [
          "excellence",
          "quality",
          "service",
          account.primary_location?.city?.toLowerCase().replace(/\s+/g, "") || "local",
          "business",
        ],
        imagePrompt: `Professional business environment, team collaboration, modern office space, ${account.color_scheme || "blue and white"} color scheme, success atmosphere`,
      },
      {
        content: `${useEmojis ? "🎯 " : ""}Success comes from understanding what our clients truly need. We listen, we learn, and we deliver ${account.expertise || "solutions"} that make a real difference.`,
        hashtags: ["clientfirst", "success", "solutions", "business", "results"],
        imagePrompt: `Business consultation meeting, professional handshake, modern conference room, trust and partnership atmosphere`,
      },
    ],
  }

  const templates = postTemplates[industry as keyof typeof postTemplates] || postTemplates.default
  const template = templates[index % templates.length]

  return {
    content: template.content,
    hashtags: template.hashtags,
    imagePrompt: template.imagePrompt,
  }
}

// Fallback function for when OpenAI is not available
async function generateFallbackPosts(account: any, count: number, accountId: string) {
  const posts = []

  for (let i = 0; i < count; i++) {
    const fallbackPost = createFallbackPost(account, i)
    const imageUrl = `/placeholder.svg?height=1792&width=1024&query=${encodeURIComponent(fallbackPost.imagePrompt)}`

    // Try to save to database
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          account_id: accountId,
          content: fallbackPost.content,
          hashtags: fallbackPost.hashtags,
          image_url: imageUrl,
          image_prompt: fallbackPost.imagePrompt,
          status: "draft",
        })
        .select()
        .single()

      if (!error && data) {
        posts.push({
          id: data.id,
          content: data.content,
          hashtags: data.hashtags,
          imageUrl: data.image_url,
          image_prompt: data.image_prompt,
          createdAt: data.created_at,
          status: data.status,
        })
      } else {
        // In-memory fallback
        posts.push({
          id: `fallback_${Date.now()}_${i}`,
          content: fallbackPost.content,
          hashtags: fallbackPost.hashtags,
          imageUrl,
          image_prompt: fallbackPost.imagePrompt,
          createdAt: new Date().toISOString(),
          status: "draft" as const,
        })
      }
    } catch (error) {
      // In-memory fallback
      posts.push({
        id: `fallback_${Date.now()}_${i}`,
        content: fallbackPost.content,
        hashtags: fallbackPost.hashtags,
        imageUrl,
        image_prompt: fallbackPost.imagePrompt,
        createdAt: new Date().toISOString(),
        status: "draft" as const,
      })
    }
  }

  return NextResponse.json(posts)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { count = 5 } = await request.json()

    // Get account from Supabase
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (accountError || !account) {
      console.error(`Account not found: ${params.id}`, accountError)
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Get existing posts to analyze patterns
    const { data: existingPosts } = await supabase
      .from("posts")
      .select("content, hashtags")
      .eq("account_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10)

    console.log(`Generating ${count} posts for account: ${account.name}`)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using fallback")
      return generateFallbackPosts(account, count, params.id)
    }

    const newPosts = []

    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating post ${i + 1} of ${count}...`)

        // Build comprehensive context for AI
        const existingPostsContext =
          existingPosts && existingPosts.length > 0
            ? `\n\nEXISTING POSTS ANALYSIS (learn from these patterns but create NEW content):
${existingPosts.map((post, idx) => `${idx + 1}. "${post.content}" | Hashtags: ${Array.isArray(post.hashtags) ? post.hashtags.join(", ") : "none"}`).join("\n")}`
            : "\n\nNo existing posts to analyze - create fresh, engaging content."

        // Generate post content with comprehensive context
        const { text: postResponse } = await generateText({
          model: openai("gpt-4o"),
          prompt: `Create an engaging social media post for this business. Return ONLY a JSON object with this exact structure:

{
  "content": "engaging post content here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "imagePrompt": "detailed image description for DALL-E"
}

BUSINESS PROFILE:
- Company: ${account.name}
- Industry: ${account.industry}
- Description: ${account.description || "Professional business"}
- Target Audience: ${account.target_audience || "General audience"}
- Brand Tone: ${account.tone || "professional"}
- Brand Personality: ${account.brand_personality || "professional and reliable"}
- Products/Services: ${account.products || "professional services"}
- Expertise: ${account.expertise || "industry expertise"}
- Company Values: ${account.company_values || "quality and service"}
- Client Types: ${account.client_types || "businesses and individuals"}
- Keywords: ${account.keywords || "business, professional"}
- Color Scheme: ${account.color_scheme || "professional colors"}
- Visual Style: ${account.visual_style || "clean and professional"}
- Image Style: ${account.image_style || "corporate_professional"}
- Location: ${account.primary_location?.city ? `${account.primary_location.city}, ${account.primary_location.state}` : "Local area"}
- Website: ${account.website_url}

CONTENT REQUIREMENTS:
- Length: ${account.text_length || 150} characters (approximate)
- ${account.use_emojis ? "Include relevant emojis" : "No emojis"}
- Tone: ${account.tone || "professional"}
- Focus on: ${account.blog_topics || "industry insights, tips, company updates, client success"}

POST CONTENT GUIDELINES:
1. Create compelling, value-driven content that speaks to ${account.target_audience || "your audience"}
2. Highlight expertise in ${account.expertise || account.industry}
3. Include a clear call-to-action or engagement hook
4. Make it shareable and relevant to ${account.industry}
5. Reflect the brand personality: ${account.brand_personality || "professional"}
6. Address pain points or interests of ${account.client_types || "your clients"}

HASHTAG STRATEGY:
- Mix of branded, industry, and trending hashtags
- Include location-based hashtags if relevant
- Use keywords: ${account.keywords || "business, professional"}
- Target audience: ${account.target_audience || "general"}
- Industry-specific tags for ${account.industry}

IMAGE PROMPT REQUIREMENTS:
- Style: ${account.image_style || "corporate_professional"}
- Colors: ${account.color_scheme || "professional colors"}
- Should complement the post content (NOT repeat the text)
- Professional quality suitable for ${account.industry}
- Visual elements: ${account.design_elements || "clean, modern design"}
- Avoid text in images - focus on visual storytelling
- Make it eye-catching for social media

CONTENT VARIETY (choose ONE focus):
- Educational tip or insight
- Behind-the-scenes content
- Client success story (anonymized)
- Industry trend or news
- Company culture or values
- Problem-solving content
- Inspirational or motivational
- Product/service highlight
- Community engagement
- Seasonal or timely content

${existingPostsContext}

IMPORTANT: 
- Create FRESH content that's different from existing posts
- Make the image prompt describe VISUALS, not repeat the post text
- Ensure hashtags are relevant and strategic
- Keep content engaging and valuable
- Match the brand voice and personality

Return ONLY the JSON object, no additional text or formatting.`,
        })

        // Parse the AI response
        let parsedPost
        try {
          let cleanedResponse = postResponse.trim()
          if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
          } else if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
          }
          parsedPost = JSON.parse(cleanedResponse)
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError)
          console.error("Raw response:", postResponse)

          // Create fallback post with better content
          parsedPost = createFallbackPost(account, i)
        }

        // Validate and clean the parsed post
        const postContent = parsedPost.content || createFallbackPost(account, i).content
        const hashtags = Array.isArray(parsedPost.hashtags)
          ? parsedPost.hashtags
          : createFallbackPost(account, i).hashtags
        const imagePrompt = parsedPost.imagePrompt || createFallbackPost(account, i).imagePrompt

        // Generate placeholder image URL with the AI-generated prompt
        const imageQuery = encodeURIComponent(imagePrompt)
        const imageUrl = `/placeholder.svg?height=1792&width=1024&query=${imageQuery}`

        // Save post to Supabase
        let savedPost = null
        try {
          console.log(`Attempting to save post ${i + 1} to database...`)

          const insertData = {
            account_id: params.id,
            content: postContent.trim(),
            hashtags,
            image_url: imageUrl,
            image_prompt: imagePrompt,
            status: "draft" as const,
          }

          const { data, error: postError } = await supabase.from("posts").insert(insertData).select().single()

          if (postError) {
            console.error("Supabase error saving post:", postError)
            console.log("Continuing with in-memory post due to database error")
          } else {
            savedPost = data
            console.log(`Successfully saved post ${i + 1} to database`)
          }
        } catch (dbError) {
          console.error("Database connection error:", dbError)
          console.log("Continuing with in-memory post due to connection error")
        }

        // Create post object for response
        const newPost = savedPost
          ? {
              id: savedPost.id,
              content: savedPost.content,
              hashtags: savedPost.hashtags || [],
              imageUrl: savedPost.image_url,
              image_prompt: savedPost.image_prompt,
              createdAt: savedPost.created_at,
              status: savedPost.status,
            }
          : {
              id: `temp_${Date.now()}_${i}`,
              content: postContent.trim(),
              hashtags,
              imageUrl,
              image_prompt: imagePrompt,
              createdAt: new Date().toISOString(),
              status: "draft" as const,
            }

        newPosts.push(newPost)

        // Add delay between generations to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (postError) {
        console.error(`Error generating post ${i + 1}:`, postError)

        // Add fallback post if individual post generation fails
        const fallbackPost = createFallbackPost(account, i)
        const fallbackImageUrl = `/placeholder.svg?height=1792&width=1024&query=${encodeURIComponent(fallbackPost.imagePrompt)}`

        newPosts.push({
          id: `fallback_${Date.now()}_${i}`,
          content: fallbackPost.content,
          hashtags: fallbackPost.hashtags,
          imageUrl: fallbackImageUrl,
          image_prompt: fallbackPost.imagePrompt,
          createdAt: new Date().toISOString(),
          status: "draft" as const,
        })
      }
    }

    console.log(`Successfully generated ${newPosts.length} posts`)
    return NextResponse.json(newPosts)
  } catch (error) {
    console.error("Error generating posts:", error)
    return NextResponse.json(
      {
        error: "Failed to generate posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
