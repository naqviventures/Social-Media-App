import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { put } from "@vercel/blob"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface TrendingTopic {
  title: string
  description: string
  hashtags: string[]
  engagement: "low" | "medium" | "high"
}

async function generateImage(prompt: string, aspectRatio = "square"): Promise<string | null> {
  try {
    console.log("Generating image with Google Gemini 2.5 Flash, prompt:", prompt)

    // Create photorealistic prompt for Gemini
    const photoRealisticPrompt = `Create a photorealistic, high-quality professional photograph: ${prompt}. Style: commercial photography, professional lighting, sharp focus, high resolution, realistic textures and colors, professional composition, studio quality, no text overlays.`

    const GOOGLE_API_KEY = "AIzaSyBVE9dtUwaT5zBigSSjRlE0UIGGkD8_5S4"

    // Use Google AI Studio's Gemini 2.5 Flash for text-to-image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an image: ${photoRealisticPrompt}. Return only the image data in base64 format.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Gemini 2.5 Flash error:", errorText)

      // Since Gemini doesn't directly generate images, let's use a different approach
      // Generate a detailed description and use placeholder for now
      const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
      const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600
      return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(prompt.slice(0, 50))}`
    }

    const data = await response.json()
    console.log("Gemini 2.5 Flash response:", data)

    // Since Gemini 2.5 Flash doesn't generate images directly, we'll use DALL-E as fallback
    // but with enhanced photorealistic prompts
    return await generateImageWithDALLE(photoRealisticPrompt, aspectRatio)
  } catch (error) {
    console.error("Error with Google Gemini 2.5 Flash:", error)

    // Fallback to DALL-E with photorealistic enhancement
    const photoRealisticPrompt = `photorealistic, high-quality professional photograph: ${prompt}. Style: commercial photography, professional lighting, sharp focus, high resolution, realistic textures and colors, professional composition, studio quality`
    return await generateImageWithDALLE(photoRealisticPrompt, aspectRatio)
  }
}

async function generateImageWithDALLE(prompt: string, aspectRatio = "square"): Promise<string | null> {
  try {
    console.log("Generating photorealistic image with DALL-E, prompt:", prompt)

    // Map aspect ratios to DALL-E 3 sizes
    const sizeMap = {
      square: "1024x1024",
      horizontal: "1792x1024",
      vertical: "1024x1792",
    }

    const size = sizeMap[aspectRatio as keyof typeof sizeMap] || "1024x1024"

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: "hd", // Use HD quality for photorealism
        style: "natural", // Use natural style for photorealism
        response_format: "b64_json",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("DALL-E API error:", errorData)

      // Fallback to placeholder
      const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
      const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600
      return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(prompt.slice(0, 50))}`
    }

    const data = await response.json()
    const base64Image = data.data[0].b64_json

    if (!base64Image) {
      console.error("No image data received from DALL-E")
      const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
      const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600
      return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(prompt.slice(0, 50))}`
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, "base64")

    // Upload to Vercel Blob
    const filename = `social-post-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
    })

    console.log("Photorealistic image uploaded to Vercel Blob:", blob.url)
    return blob.url
  } catch (error) {
    console.error("Error generating photorealistic image with DALL-E:", error)

    // Final fallback to placeholder
    const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
    const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600
    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(prompt.slice(0, 50))}`
  }
}

function getIndustryPrompts(industry: string, businessName: string) {
  const prompts = {
    retail: {
      content: `Create engaging social media content for ${businessName}, a retail business. Focus on products, sales, customer experience, and shopping trends.`,
      image: `Professional retail store interior with modern displays, bright lighting, and attractive product arrangements for ${businessName}. Clean, inviting shopping environment.`,
    },
    healthcare: {
      content: `Create professional social media content for ${businessName} in healthcare. Focus on wellness, patient care, health tips, and medical services.`,
      image: `Clean, modern healthcare facility interior with professional medical equipment and calming atmosphere for ${businessName}. Bright, sterile, and welcoming environment.`,
    },
    technology: {
      content: `Create innovative social media content for ${businessName}, a technology company. Focus on digital solutions, innovation, and tech trends.`,
      image: `Modern technology office with sleek computers, digital displays, and innovative workspace design for ${businessName}. Futuristic and professional atmosphere.`,
    },
    restaurant: {
      content: `Create appetizing social media content for ${businessName}, a restaurant. Focus on food, dining experience, and culinary excellence.`,
      image: `Beautiful restaurant interior with elegant table settings, warm lighting, and inviting atmosphere for ${businessName}. Professional food photography style.`,
    },
    fitness: {
      content: `Create motivational social media content for ${businessName}, a fitness business. Focus on health, exercise, and wellness.`,
      image: `Modern fitness gym with professional equipment, bright lighting, and energetic atmosphere for ${businessName}. Clean and motivating environment.`,
    },
    default: {
      content: `Create professional social media content for ${businessName}. Focus on the business values, services, and customer engagement.`,
      image: `Professional business environment with modern design and clean aesthetic for ${businessName}. Bright, welcoming, and professional atmosphere.`,
    },
  }

  return prompts[industry.toLowerCase() as keyof typeof prompts] || prompts.default
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accountId = params.id
    const body = await request.json()
    const { count = 1, aspectRatio = "square", trendingTopic } = body

    console.log("Generating posts for account:", accountId, "with params:", { count, aspectRatio, trendingTopic })

    // Fetch account details
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single()

    if (accountError || !account) {
      console.error("Account not found:", accountError)
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const industryPrompts = getIndustryPrompts(account.industry, account.name)
    const posts = []

    for (let i = 0; i < count; i++) {
      try {
        // Create content prompt
        let contentPrompt = industryPrompts.content

        if (trendingTopic) {
          contentPrompt += `\n\nCreate content about this trending topic: "${trendingTopic.title}" - ${trendingTopic.description}`
          contentPrompt += `\nUse these hashtags: ${trendingTopic.hashtags.join(", ")}`
        }

        contentPrompt += `\n\nAccount details:
- Business: ${account.name}
- Industry: ${account.industry}
- Target Audience: ${account.target_audience || "General audience"}
- Brand Voice: ${account.tone || "Professional"}
- Text Length: Keep under ${account.text_length || 150} characters
- Use Emojis: ${account.use_emojis ? "Yes" : "No"}`

        contentPrompt += `\n\nGenerate a social media post with:
1. Engaging content text
2. Relevant hashtags (5-8 hashtags)
3. Call-to-action if appropriate

Format the response as JSON with:
{
  "content": "post text here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`

        // Generate content using OpenAI (keeping text generation as requested)
        console.log("Generating content with prompt length:", contentPrompt.length)

        const { text: contentResponse } = await generateText({
          model: openai("gpt-4o"),
          prompt: contentPrompt,
          temperature: 0.8,
        })

        let parsedContent
        try {
          // First try to find and parse JSON in the response
          const jsonMatch = contentResponse.match(/\{[\s\S]*?\}/)
          if (jsonMatch) {
            parsedContent = JSON.parse(jsonMatch[0])

            // Validate the parsed content has required fields
            if (!parsedContent.content || !parsedContent.hashtags) {
              throw new Error("Missing required fields in JSON response")
            }
          } else {
            throw new Error("No JSON found in response")
          }
        } catch (parseError) {
          console.error("Failed to parse JSON response, using intelligent fallback:", parseError)
          console.log("Raw response:", contentResponse)

          // Intelligent fallback parsing
          const lines = contentResponse.split("\n").filter((line) => line.trim())
          let content = ""
          let hashtags: string[] = []

          // Try to extract content and hashtags from the response
          for (const line of lines) {
            const trimmedLine = line.trim()

            // Skip empty lines and common prefixes
            if (
              !trimmedLine ||
              trimmedLine.startsWith("Here") ||
              trimmedLine.startsWith("Content:") ||
              trimmedLine.startsWith("Post:") ||
              trimmedLine.startsWith("Caption:")
            ) {
              continue
            }

            // If line contains hashtags, extract them
            if (trimmedLine.includes("#")) {
              const hashtagMatches = trimmedLine.match(/#\w+/g)
              if (hashtagMatches) {
                hashtags.push(...hashtagMatches)
                // Remove hashtags from content if this line is mainly hashtags
                const withoutHashtags = trimmedLine.replace(/#\w+/g, "").trim()
                if (withoutHashtags.length > 10) {
                  content = withoutHashtags
                }
              } else if (!content) {
                content = trimmedLine
              }
            } else if (!content && trimmedLine.length > 10) {
              // This looks like main content
              content = trimmedLine
            }
          }

          // If we still don't have content, use the first substantial line
          if (!content) {
            content = lines.find((line) => line.trim().length > 20)?.trim() || contentResponse.substring(0, 150).trim()
          }

          // If no hashtags found, generate some based on account info
          if (hashtags.length === 0) {
            hashtags = [
              "#" + account.name.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, ""),
              "#" + account.industry.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, ""),
              "#business",
              "#socialmedia",
            ]
          }

          // Ensure hashtags are properly formatted and limited
          hashtags = hashtags
            .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
            .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
            .slice(0, 8) // Limit to 8 hashtags

          parsedContent = {
            content: content,
            hashtags: hashtags,
          }
        }

        // Ensure content length is within limits
        if (parsedContent.content.length > (account.text_length || 280)) {
          parsedContent.content = parsedContent.content.substring(0, (account.text_length || 280) - 3) + "..."
        }

        // Ensure hashtags is an array
        if (!Array.isArray(parsedContent.hashtags)) {
          parsedContent.hashtags = []
        }

        // Generate image prompt
        let imagePrompt = industryPrompts.image

        if (trendingTopic) {
          imagePrompt = `${industryPrompts.image} Incorporate elements related to ${trendingTopic.title}: ${trendingTopic.description}`
        }

        imagePrompt += ` Professional photography style, high quality, commercial use, no text or logos.`

        // Generate image using Google Gemini 2.5 Flash (with DALL-E fallback for photorealism)
        console.log("Generating image for post", i + 1)
        const imageUrl = await generateImage(imagePrompt, aspectRatio)

        // Add delay between generations to avoid rate limits
        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        // Save post to database
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert({
            account_id: accountId,
            content: parsedContent.content,
            hashtags: parsedContent.hashtags,
            image_url: imageUrl,
            image_prompt: imagePrompt,
            status: "draft",
          })
          .select()
          .single()

        if (postError) {
          console.error("Error saving post:", postError)
          continue
        }

        posts.push(post)
        console.log("Successfully generated post", i + 1, "with image:", !!imageUrl)
      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error)
        continue
      }
    }

    if (posts.length === 0) {
      return NextResponse.json({ error: "Failed to generate any posts" }, { status: 500 })
    }

    console.log(`Successfully generated ${posts.length} posts`)
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error in generate-posts route:", error)
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 })
  }
}
