import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Absolutely ensure we return JSON no matter what happens
  try {
    console.log("=== Website Analysis API Started ===")

    // Step 1: Parse request body safely
    let requestData
    try {
      requestData = await request.json()
      console.log("Request parsed successfully")
    } catch (parseError) {
      console.error("Request parse error:", parseError)
      return NextResponse.json({
        error: "Invalid request format",
        fallback: true,
        name: "Business",
        industry: "business",
        description: "Professional business services",
        tone: "professional",
        colorScheme: "blue and white",
        keywords: "business, professional, service",
      })
    }

    const { url } = requestData
    console.log("Analyzing URL:", url)

    // Step 2: Validate URL
    if (!url || typeof url !== "string") {
      console.log("Invalid URL provided")
      return NextResponse.json({
        error: "URL is required",
        fallback: true,
        name: "Business",
        industry: "business",
        description: "Professional business services",
        tone: "professional",
        colorScheme: "blue and white",
        keywords: "business, professional, service",
      })
    }

    // Step 3: Extract business name from URL
    let businessName = "Business"
    try {
      const cleanUrl = url.replace(/^https?:\/\//, "").replace(/^www\./, "")
      const domain = cleanUrl.split("/")[0].split(".")[0]
      businessName = domain.charAt(0).toUpperCase() + domain.slice(1).replace(/[-_]/g, " ")
      console.log("Extracted business name:", businessName)
    } catch (nameError) {
      console.error("Error extracting business name:", nameError)
    }

    // Step 4: Check if OpenAI is available
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    console.log("OpenAI available:", hasOpenAI)

    // Step 5: Try to fetch website content
    let websiteContent = ""
    const socialMedia = {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    }

    try {
      console.log("Fetching website content...")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        websiteContent = await response.text()
        console.log(`Fetched ${websiteContent.length} characters`)

        // Extract social media links
        const socialPatterns = {
          facebook: /facebook\.com\/([a-zA-Z0-9._-]+)/i,
          instagram: /instagram\.com\/([a-zA-Z0-9._-]+)/i,
          twitter: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9._-]+)/i,
          linkedin: /linkedin\.com\/(?:company\/|in\/)([a-zA-Z0-9._-]+)/i,
          youtube: /youtube\.com\/(?:channel\/|user\/|c\/)([a-zA-Z0-9._-]+)/i,
        }

        for (const [platform, pattern] of Object.entries(socialPatterns)) {
          const match = websiteContent.match(pattern)
          if (match) {
            socialMedia[platform as keyof typeof socialMedia] = `https://${platform}.com/${match[1]}`
          }
        }
      }
    } catch (fetchError) {
      console.error("Website fetch error:", fetchError)
    }

    // Step 6: Prepare result with fallback data
    const result = {
      name: businessName,
      industry: getIndustryFromName(businessName),
      description: `${businessName} is a professional business providing quality services to customers.`,
      goals: "Provide excellent service and grow the business",
      targetAudience: "Local customers and businesses",
      tone: "professional",
      colorScheme: "blue and white",
      keywords: `${businessName.toLowerCase()}, business, professional, service, quality, local`,
      products: "Professional services and solutions",
      expertise: "Industry expertise and customer service",
      blogTopics: "industry trends, customer stories, tips, company news, best practices",
      companyValues: "Quality, integrity, customer satisfaction",
      clientTypes: "Businesses and individual customers",
      brandPersonality: "Professional, reliable, trustworthy",
      imageStyle: "corporate_professional",
      visualStyle: "Clean, professional, modern",
      designElements: "Simple, clean lines, professional imagery",
      layoutStyle: "Modern, user-friendly, organized",
      locationStrategy: "local",
      primaryLocation: { city: "", state: "", country: "United States" },
      serviceLocations: [],
      logoUrl: "",
      facebookUrl: socialMedia.facebook,
      instagramUrl: socialMedia.instagram,
      twitterUrl: socialMedia.twitter,
      linkedinUrl: socialMedia.linkedin,
      youtubeUrl: socialMedia.youtube,
      contactInfo: { phones: [], emails: [], addresses: [] },
      fullAnalysis: `Basic analysis completed for ${businessName}. ${Object.values(socialMedia).filter(Boolean).length} social media profiles found.`,
      fallback: !hasOpenAI,
      error: hasOpenAI ? undefined : "AI analysis not available, using basic analysis",
    }

    // Step 7: Try AI analysis if available
    if (hasOpenAI && websiteContent) {
      try {
        console.log("Attempting AI analysis...")
        const aiResult = await performAIAnalysis(url, websiteContent, businessName)
        if (aiResult) {
          Object.assign(result, aiResult)
          result.fallback = false
          delete result.error
          console.log("AI analysis successful")
        }
      } catch (aiError) {
        console.error("AI analysis failed:", aiError)
        result.error = "AI analysis failed, using extracted data"
      }
    }

    console.log("Analysis completed, returning result")
    return NextResponse.json(result)
  } catch (criticalError) {
    // Final safety net - this should never execute
    console.error("CRITICAL ERROR:", criticalError)

    return NextResponse.json({
      error: "Server error occurred",
      fallback: true,
      name: "Business",
      industry: "business",
      description: "Professional business services",
      tone: "professional",
      colorScheme: "blue and white",
      keywords: "business, professional, service",
      products: "Professional services",
      expertise: "Industry expertise",
      blogTopics: "industry trends, tips, news",
      companyValues: "Quality, integrity",
      clientTypes: "Businesses and individuals",
      brandPersonality: "Professional",
      imageStyle: "corporate_professional",
      visualStyle: "Clean and professional",
      designElements: "Modern design",
      layoutStyle: "User-friendly",
      locationStrategy: "local",
      primaryLocation: { city: "", state: "", country: "United States" },
      serviceLocations: [],
      logoUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      contactInfo: { phones: [], emails: [], addresses: [] },
      fullAnalysis: "Basic analysis completed with fallback data.",
    })
  }
}

// Helper function to guess industry from business name
function getIndustryFromName(name: string): string {
  const lowerName = name.toLowerCase()

  if (
    lowerName.includes("health") ||
    lowerName.includes("medical") ||
    lowerName.includes("clinic") ||
    lowerName.includes("doctor") ||
    lowerName.includes("spine")
  ) {
    return "healthcare"
  }
  if (lowerName.includes("tech") || lowerName.includes("software") || lowerName.includes("digital")) {
    return "technology"
  }
  if (lowerName.includes("law") || lowerName.includes("legal") || lowerName.includes("attorney")) {
    return "legal"
  }
  if (lowerName.includes("real estate") || lowerName.includes("realty")) {
    return "real-estate"
  }
  if (lowerName.includes("restaurant") || lowerName.includes("food") || lowerName.includes("cafe")) {
    return "food"
  }

  return "business"
}

// AI analysis function (only called if OpenAI is available)
async function performAIAnalysis(url: string, content: string, businessName: string) {
  try {
    // Only import AI modules when we actually need them
    const { generateText } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    // Clean content for AI
    const cleanContent = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3000)

    const prompt = `Analyze this website and return comprehensive business information in JSON format.

Website: ${url}
Business: ${businessName}
Content: ${cleanContent}

Return ONLY valid JSON with this exact structure (fill ALL fields with your best analysis):

{
  "name": "Business name from website",
  "industry": "specific industry category",
  "description": "2-3 sentence business description",
  "goals": "inferred business goals and objectives",
  "targetAudience": "detailed target audience description",
  "tone": "brand tone (professional/friendly/casual/authoritative/playful)",
  "colorScheme": "primary colors found on website",
  "keywords": "relevant SEO keywords comma separated",
  "products": "main products and services offered",
  "expertise": "areas of specialization and expertise",
  "blogTopics": "suggested content topics for blogs",
  "companyValues": "inferred company values and mission",
  "clientTypes": "types of customers they serve",
  "brandPersonality": "brand personality traits",
  "imageStyle": "visual style preference",
  "visualStyle": "overall aesthetic description",
  "designElements": "design elements and style notes",
  "layoutStyle": "website layout characteristics"
}

Analyze the website content thoroughly and provide detailed, specific information for each field. Make educated inferences based on the content, industry, and business type.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 500,
    })

    // Parse AI response safely
    const cleanedText = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleanedText)

    return {
      name: parsed.name || businessName,
      industry: parsed.industry || "business",
      description: parsed.description || `${businessName} provides professional services`,
      goals: parsed.goals || "Grow business and serve customers effectively",
      targetAudience: parsed.targetAudience || "Local customers and businesses seeking quality services",
      tone: parsed.tone || "professional",
      colorScheme: parsed.colorScheme || "blue and white",
      keywords: parsed.keywords || `${businessName.toLowerCase()}, professional, service`,
      products: parsed.products || "Professional services and solutions",
      expertise: parsed.expertise || "Industry expertise and customer service",
      blogTopics: parsed.blogTopics || "industry insights, tips, best practices, customer success stories",
      companyValues: parsed.companyValues || "Quality, integrity, customer satisfaction, excellence",
      clientTypes: parsed.clientTypes || "Businesses and individual customers",
      brandPersonality: parsed.brandPersonality || "Professional, reliable, trustworthy",
      imageStyle: parsed.imageStyle || "corporate_professional",
      visualStyle: parsed.visualStyle || "Clean, professional, modern",
      designElements: parsed.designElements || "Simple, clean lines, professional imagery",
      layoutStyle: parsed.layoutStyle || "Modern, user-friendly, organized",
    }
  } catch (aiError) {
    console.error("AI analysis error:", aiError)
    return null
  }
}
