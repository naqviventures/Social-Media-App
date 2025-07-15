import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { count = 2, targetKeywords = [], keywordData } = await request.json()

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

    console.log(`Generating ${count} SEO blogs for account: ${account.name}`)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, returning error")
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    const newBlogs = []

    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating blog ${i + 1} of ${count}...`)

        // Select target keyword for this blog
        const targetKeyword =
          targetKeywords[i] || keywordData?.opportunities?.[i]?.keyword || `${account.industry} best practices`

        // Generate comprehensive blog content with proper SEO structure
        const { text: blogContent } = await generateText({
          model: openai("gpt-4o"),
          prompt: `Create a comprehensive, SEO-optimized blog post for ${account.name}, a ${account.industry} business.

BUSINESS CONTEXT:
- Company: ${account.name}
- Industry: ${account.industry}
- Description: ${account.description || "Professional services company"}
- Website: ${account.website_url}
- Target Audience: ${account.target_audience || "Business professionals"}
- Brand Tone: ${account.tone || "professional"}
- Products/Services: ${account.products || "Professional services"}
- Expertise: ${account.expertise || "Industry expertise"}

SEO REQUIREMENTS:
- Primary Target Keyword: "${targetKeyword}"
- Word Count: 1500-2500 words
- Include proper heading structure (H1, H2, H3)
- Natural keyword integration (avoid keyword stuffing)
- Include related keywords and semantic variations
- Write for both users and search engines

CONTENT STRUCTURE REQUIREMENTS:
1. Compelling, SEO-optimized title that includes the target keyword
2. Engaging introduction that hooks the reader
3. Well-structured body with clear headings and subheadings
4. Actionable insights and practical advice
5. Strong conclusion with call-to-action
6. Natural integration of the target keyword throughout

BLOG POST REQUIREMENTS:
- Write in ${account.tone || "professional"} tone
- Provide genuine value and expertise
- Include specific, actionable advice
- Use examples and case studies where relevant
- Address common pain points in ${account.industry}
- Establish authority and expertise
- Include internal linking opportunities (mention related topics)
- End with a clear call-to-action

KEYWORD INTEGRATION:
- Use "${targetKeyword}" naturally throughout the content
- Include variations and related terms
- Maintain keyword density of 1-2%
- Use the keyword in headings where natural
- Include long-tail variations

Return the blog post in the following JSON format:
{
  "title": "SEO-optimized blog title with target keyword",
  "metaTitle": "Meta title (50-60 characters) with target keyword",
  "metaDescription": "Compelling meta description (150-160 characters) with target keyword",
  "content": "Full blog post content with proper markdown formatting",
  "secondaryKeywords": ["related keyword 1", "related keyword 2", "related keyword 3", "related keyword 4", "related keyword 5"],
  "slug": "url-friendly-slug-with-target-keyword"
}

Focus on creating content that:
- Answers real questions your target audience has
- Provides actionable, practical advice
- Establishes ${account.name} as an authority in ${account.industry}
- Naturally incorporates the target keyword "${targetKeyword}"
- Is genuinely helpful and valuable to readers
- Follows SEO best practices for content structure

Return ONLY the JSON object with no additional formatting or text.`,
        })

        let parsedBlog
        try {
          // Clean the response to remove any markdown formatting
          let cleanedContent = blogContent.trim()
          if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/\s*```$/, "")
          } else if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
          }

          parsedBlog = JSON.parse(cleanedContent)
        } catch (parseError) {
          console.error("Failed to parse blog content:", parseError)
          console.error("Raw blog response:", blogContent)

          // Fallback: create structured blog content
          parsedBlog = {
            title: `${targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1)}: A Complete Guide for ${account.industry}`,
            metaTitle: `${targetKeyword} Guide | ${account.name}`,
            metaDescription: `Discover expert insights on ${targetKeyword} from ${account.name}. Learn best practices, tips, and strategies for ${account.industry} success.`,
            content: `# ${targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1)}: A Complete Guide

## Introduction

In today's competitive ${account.industry} landscape, understanding ${targetKeyword} is crucial for success. This comprehensive guide will provide you with actionable insights and best practices.

## What You Need to Know About ${targetKeyword}

${targetKeyword} plays a vital role in ${account.industry}. Here's what every professional should understand:

### Key Benefits
- Improved efficiency and productivity
- Better decision-making capabilities
- Enhanced competitive advantage
- Increased customer satisfaction

### Common Challenges
Many businesses struggle with implementing effective ${targetKeyword} strategies. The most common challenges include:

1. **Lack of expertise** - Understanding the complexities involved
2. **Resource constraints** - Allocating sufficient time and budget
3. **Technology barriers** - Choosing the right tools and platforms
4. **Change management** - Getting team buy-in and adoption

## Best Practices for ${targetKeyword}

Based on our experience in ${account.industry}, here are proven strategies:

### 1. Start with Clear Objectives
Define what you want to achieve with ${targetKeyword}. Set measurable goals and timelines.

### 2. Invest in the Right Tools
Choose solutions that align with your business needs and budget.

### 3. Focus on Training
Ensure your team has the skills and knowledge needed for success.

### 4. Monitor and Optimize
Regularly review performance and make adjustments as needed.

## Conclusion

Mastering ${targetKeyword} is essential for ${account.industry} success. By following these best practices and staying informed about industry trends, you can achieve better results.

Ready to improve your ${targetKeyword} strategy? Contact ${account.name} today to learn how we can help you succeed.`,
            secondaryKeywords: [
              `${targetKeyword} best practices`,
              `${targetKeyword} guide`,
              `${account.industry} ${targetKeyword}`,
              `${targetKeyword} strategies`,
              `${targetKeyword} tips`,
            ],
            slug: targetKeyword
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-"),
          }
        }

        // Calculate word count
        const wordCount = parsedBlog.content.split(/\s+/).filter((word: string) => word.length > 0).length

        // Save blog to Supabase
        let savedBlog = null
        try {
          console.log(`Attempting to save blog ${i + 1} to database...`)

          const insertData = {
            account_id: params.id,
            title: parsedBlog.title,
            slug: parsedBlog.slug,
            content: parsedBlog.content,
            meta_title: parsedBlog.metaTitle,
            meta_description: parsedBlog.metaDescription,
            target_keyword: targetKeyword,
            secondary_keywords: parsedBlog.secondaryKeywords || [],
            word_count: wordCount,
            status: "draft" as const,
          }

          const { data, error: blogError } = await supabase.from("blogs").insert(insertData).select().single()

          if (blogError) {
            console.error("Supabase error saving blog:", blogError)
            console.log("Continuing with in-memory blog due to database error")
          } else {
            savedBlog = data
            console.log(`Successfully saved blog ${i + 1} to database`)
          }
        } catch (dbError) {
          console.error("Database connection error:", dbError)
          console.log("Continuing with in-memory blog due to connection error")
        }

        // Create blog object for response
        const newBlog = savedBlog
          ? {
              id: savedBlog.id,
              title: savedBlog.title,
              slug: savedBlog.slug,
              content: savedBlog.content,
              metaTitle: savedBlog.meta_title,
              metaDescription: savedBlog.meta_description,
              targetKeyword: savedBlog.target_keyword,
              secondaryKeywords: savedBlog.secondary_keywords || [],
              wordCount: savedBlog.word_count,
              status: savedBlog.status,
              createdAt: savedBlog.created_at,
            }
          : {
              id: `temp_blog_${Date.now()}_${i}`,
              title: parsedBlog.title,
              slug: parsedBlog.slug,
              content: parsedBlog.content,
              metaTitle: parsedBlog.metaTitle,
              metaDescription: parsedBlog.metaDescription,
              targetKeyword: targetKeyword,
              secondaryKeywords: parsedBlog.secondaryKeywords || [],
              wordCount: wordCount,
              status: "draft" as const,
              createdAt: new Date().toISOString(),
            }

        newBlogs.push(newBlog)

        // Add delay between generations to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 3000))
      } catch (blogError) {
        console.error(`Error generating blog ${i + 1}:`, blogError)
        console.log(`Skipping blog ${i + 1} due to error, continuing with remaining blogs...`)
      }
    }

    if (newBlogs.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to generate any blogs",
          details: "All blog generation attempts failed. Please try again.",
        },
        { status: 500 },
      )
    }

    console.log(`Successfully generated ${newBlogs.length} SEO blogs`)
    return NextResponse.json(newBlogs)
  } catch (error) {
    console.error("Error generating blogs:", error)
    return NextResponse.json(
      {
        error: "Failed to generate blogs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
