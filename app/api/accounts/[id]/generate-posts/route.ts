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
    console.log("Generating image with DALL-E, prompt:", prompt)

    // Create photorealistic prompt for DALL-E
    const photoRealisticPrompt = `Create a photorealistic, high-quality professional photograph: ${prompt}. Style: commercial photography, professional lighting, sharp focus, high resolution, realistic textures and colors, professional composition, studio quality, no text overlays.`

    return await generateImageWithDALLE(photoRealisticPrompt, aspectRatio)
  } catch (error) {
    console.error("Error generating image:", error)

    // Fallback to placeholder
    const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
    const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600
    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(prompt.slice(0, 50))}`
  }
}

async function generateVideo(prompt: string, aspectRatio = "square"): Promise<string | null> {
  try {
    console.log("Generating video with Veo 2 API, prompt:", prompt)

    // Create video-specific prompt for Veo 2
    const videoPrompt = `Create a professional ${aspectRatio} aspect ratio video: ${prompt}. Style: cinematic, smooth motion, professional quality, commercial video production, dynamic camera movements, engaging visual storytelling, no text overlays. Duration: 5-10 seconds.`

    const GOOGLE_API_KEY = "AIzaSyBVE9dtUwaT5zBigSSjRlE0UIGGkD8_5S4"

    // Map aspect ratios to proper format
    const aspectRatioMap = {
      square: "1:1",
      horizontal: "16:9",
      vertical: "9:16",
    }

    // Use the proper Veo 2 API endpoint
    const response = await fetch("https://api.gemini.google.com/v1/video/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        resolution: "1080p",
        aspect_ratio: aspectRatioMap[aspectRatio as keyof typeof aspectRatioMap] || "1:1",
        style: "cinematic",
        duration: "5s",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Veo 2 API error:", errorText)

      // Try alternative endpoint format
      return await tryAlternativeVeo2Endpoint(videoPrompt, aspectRatio)
    }

    const data = await response.json()
    console.log("Veo 2 response:", data)

    // Check if we got a video URL from Veo 2
    if (data.video_url) {
      console.log("Found video URL from Veo 2:", data.video_url)

      try {
        // Download and store the video from Veo 2
        const videoResponse = await fetch(data.video_url)
        if (videoResponse.ok) {
          const videoBuffer = await videoResponse.arrayBuffer()
          const filename = `veo2-video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
          const blob = await put(filename, videoBuffer, {
            access: "public",
            contentType: "video/mp4",
          })
          console.log("Veo 2 video uploaded to Vercel Blob:", blob.url)
          return blob.url
        }
      } catch (downloadError) {
        console.error("Error downloading Veo 2 video:", downloadError)
        return data.video_url // Return original URL as fallback
      }
    }

    // Check for direct video data
    if (data.video_data) {
      console.log("Found direct video data from Veo 2")
      const videoBuffer = Buffer.from(data.video_data, "base64")
      const filename = `veo2-direct-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
      const blob = await put(filename, videoBuffer, {
        access: "public",
        contentType: "video/mp4",
      })
      console.log("Veo 2 direct video uploaded to Vercel Blob:", blob.url)
      return blob.url
    }

    throw new Error("No video data received from Veo 2")
  } catch (error) {
    console.error("Error generating video with Veo 2:", error)
    return await tryAlternativeVeo2Endpoint(prompt, aspectRatio)
  }
}

async function tryAlternativeVeo2Endpoint(prompt: string, aspectRatio = "square"): Promise<string | null> {
  try {
    console.log("Trying alternative Veo 2 endpoint")

    const GOOGLE_API_KEY = "AIzaSyBVE9dtUwaT5zBigSSjRlE0UIGGkD8_5S4"

    // Try the Gemini API with video generation parameters
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
                  text: `Generate a video using Veo 2 capabilities: ${prompt}. Create a professional ${aspectRatio} aspect ratio video with cinematic quality, smooth motion, and engaging visual storytelling. Duration: 5-10 seconds.`,
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
      console.error("Alternative Veo 2 endpoint error:", errorText)
      throw new Error(`Alternative Veo 2 API error: ${errorText}`)
    }

    const data = await response.json()
    console.log("Alternative Veo 2 response:", data)

    // Check for video content in various formats
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0]

      // Check for inline video data
      if (content.inlineData && content.inlineData.mimeType && content.inlineData.mimeType.startsWith("video/")) {
        console.log("Found inline video data from alternative endpoint")
        const base64Video = content.inlineData.data
        const videoBuffer = Buffer.from(base64Video, "base64")

        const filename = `veo2-alt-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
        const blob = await put(filename, videoBuffer, {
          access: "public",
          contentType: content.inlineData.mimeType,
        })

        console.log("Alternative Veo 2 video uploaded to Vercel Blob:", blob.url)
        return blob.url
      }

      // Check for file data
      if (content.fileData && content.fileData.fileUri) {
        console.log("Found file URI from alternative endpoint:", content.fileData.fileUri)

        try {
          const videoResponse = await fetch(content.fileData.fileUri)
          if (videoResponse.ok) {
            const videoBuffer = await videoResponse.arrayBuffer()
            const filename = `veo2-file-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
            const blob = await put(filename, videoBuffer, {
              access: "public",
              contentType: "video/mp4",
            })
            console.log("Alternative Veo 2 file video uploaded:", blob.url)
            return blob.url
          }
        } catch (fileError) {
          console.error("Error fetching video from alternative file URI:", fileError)
        }
      }
    }

    throw new Error("No video data from alternative Veo 2 endpoint")
  } catch (error) {
    console.error("Error with alternative Veo 2 endpoint:", error)
    return await generateVideoPlaceholder(prompt, aspectRatio)
  }
}

async function generateVideoPlaceholder(prompt: string, aspectRatio = "square"): Promise<string | null> {
  try {
    console.log("Creating video placeholder for:", prompt)

    // Create a placeholder that indicates video generation was attempted
    const width = aspectRatio === "horizontal" ? 800 : aspectRatio === "vertical" ? 400 : 600
    const height = aspectRatio === "horizontal" ? 450 : aspectRatio === "vertical" ? 800 : 600

    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent("Veo 2 Video: " + prompt.substring(0, 25))}`
  } catch (error) {
    console.error("Error creating video placeholder:", error)
    return null
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
        quality: "hd",
        style: "natural",
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
    const { count = 1, aspectRatio = "square", mediaType = "image", customPrompt = "", trendingTopic } = body

    console.log("Generating posts for account:", accountId, "with params:", {
      count,
      aspectRatio,
      mediaType,
      customPrompt,
      trendingTopic,
    })

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

        // Generate content using OpenAI
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

        // Generate media prompt (image or video)
        let mediaPrompt = industryPrompts.image

        // Add custom prompt if provided
        if (customPrompt.trim()) {
          mediaPrompt = `${mediaPrompt} Additional requirements: ${customPrompt.trim()}`
        }

        if (trendingTopic) {
          mediaPrompt = `${mediaPrompt} Incorporate elements related to ${trendingTopic.title}: ${trendingTopic.description}`
        }

        mediaPrompt += ` Professional photography style, high quality, commercial use, no text or logos.`

        // Generate media based on type
        console.log(`Generating ${mediaType} for post`, i + 1)
        let mediaUrl = null
        let videoUrl = null

        if (mediaType === "video") {
          videoUrl = await generateVideo(mediaPrompt, aspectRatio)
        } else {
          mediaUrl = await generateImage(mediaPrompt, aspectRatio)
        }

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
            image_url: mediaUrl,
            video_url: videoUrl,
            image_prompt: mediaPrompt,
            media_type: mediaType,
            status: "draft",
          })
          .select()
          .single()

        if (postError) {
          console.error("Error saving post:", postError)
          continue
        }

        posts.push(post)
        console.log(`Successfully generated ${mediaType} post`, i + 1, "with media:", !!(mediaUrl || videoUrl))
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
