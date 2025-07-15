import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    console.log(`Analyzing keywords for account: ${account.name}`)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, returning demo data")
      return NextResponse.json(getDemoKeywordData(account))
    }

    try {
      // Build location context
      const serviceLocations = account.service_locations || []
      const targetRegions = account.target_regions || []
      const primaryLocation = account.primary_location || {}

      const locationContext = buildLocationContext(serviceLocations, targetRegions, primaryLocation)

      // Generate keyword analysis with AI
      const { text: keywordAnalysis } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze SEO keywords for ${account.name}, a ${account.industry} business.

BUSINESS CONTEXT:
- Company: ${account.name}
- Industry: ${account.industry}
- Description: ${account.description || "Professional services company"}
- Website: ${account.website_url}
- Target Audience: ${account.target_audience || "Business professionals"}
- Products/Services: ${account.products || "Professional services"}
- Expertise: ${account.expertise || "Industry expertise"}

LOCATION CONTEXT:
${locationContext}

ANALYSIS REQUIREMENTS:
1. Identify 5-8 keywords they're likely currently ranking for (based on their business)
2. Find 8-12 keyword opportunities they should target (not currently ranking for)
3. Include local SEO keywords based on their service locations
4. Consider search volume, difficulty, and user intent
5. Include location-specific variations like "[service] in [city]", "[service] near me"

Return the analysis in this exact JSON format:
{
  "currentRankings": [
    {
      "keyword": "keyword phrase",
      "position": 15,
      "searchVolume": 1200,
      "difficulty": "Medium"
    }
  ],
  "opportunities": [
    {
      "keyword": "keyword phrase",
      "searchVolume": 800,
      "difficulty": "Low",
      "intent": "informational",
      "localVariations": ["keyword + city", "keyword near me"]
    }
  ],
  "competitorGaps": [
    {
      "keyword": "keyword phrase",
      "competitors": ["competitor1.com", "competitor2.com"],
      "opportunity": "High"
    }
  ]
}

Focus on:
- Industry-specific keywords for ${account.industry}
- Service-based keywords related to their offerings
- Local SEO opportunities for their service areas
- Long-tail keywords with good conversion potential
- Question-based keywords their audience would search

Return ONLY the JSON object with no additional formatting or text.`,
      })

      // Parse the AI response
      let parsedData
      try {
        // Clean the response to remove any markdown formatting
        let cleanedResponse = keywordAnalysis.trim()
        if (cleanedResponse.startsWith("```json")) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        } else if (cleanedResponse.startsWith("```")) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "")
        }

        parsedData = JSON.parse(cleanedResponse)
      } catch (parseError) {
        console.error("Failed to parse AI keyword analysis:", parseError)
        console.error("Raw AI response:", keywordAnalysis)

        // Return demo data as fallback
        return NextResponse.json(getDemoKeywordData(account))
      }

      // Validate the parsed data structure
      if (!parsedData.currentRankings || !parsedData.opportunities) {
        console.error("Invalid keyword analysis structure:", parsedData)
        return NextResponse.json(getDemoKeywordData(account))
      }

      console.log(`Successfully analyzed keywords for ${account.name}`)
      return NextResponse.json(parsedData)
    } catch (aiError) {
      console.error("AI keyword analysis error:", aiError)
      // Return demo data as fallback
      return NextResponse.json(getDemoKeywordData(account))
    }
  } catch (error) {
    console.error("Error in keyword analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze keywords",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function buildLocationContext(serviceLocations: any[], targetRegions: any[], primaryLocation: any): string {
  let context = ""

  if (primaryLocation?.city) {
    context += `Primary Location: ${primaryLocation.city}${primaryLocation.state ? `, ${primaryLocation.state}` : ""}\n`
  }

  if (serviceLocations.length > 0) {
    context += `Service Locations:\n`
    serviceLocations.forEach((loc) => {
      context += `- ${loc.city}${loc.state ? `, ${loc.state}` : ""} (${loc.radius} mile radius)\n`
    })
  }

  if (targetRegions.length > 0) {
    context += `Target Regions:\n`
    targetRegions.forEach((region) => {
      context += `- ${region.name} (${region.type})\n`
    })
  }

  return context || "No specific location targeting configured"
}

function getDemoKeywordData(account: any) {
  const industry = account.industry || "business"
  const primaryCity = account.primary_location?.city || "your city"
  const primaryState = account.primary_location?.state || "your state"

  // Industry-specific demo data
  const industryKeywords = {
    healthcare: {
      current: [
        {
          keyword: `${industry} services ${primaryState.toLowerCase()}`,
          position: 15,
          searchVolume: 1200,
          difficulty: "Medium",
        },
        {
          keyword: `${account.name?.toLowerCase().replace(/\s+/g, " ")}`,
          position: 3,
          searchVolume: 500,
          difficulty: "Low",
        },
        {
          keyword: `medical practice ${primaryCity.toLowerCase()}`,
          position: 25,
          searchVolume: 800,
          difficulty: "High",
        },
        { keyword: `healthcare providers near me`, position: 18, searchVolume: 2200, difficulty: "Medium" },
        {
          keyword: `${industry} specialists ${primaryState.toLowerCase()}`,
          position: 12,
          searchVolume: 900,
          difficulty: "Medium",
        },
      ],
      opportunities: [
        {
          keyword: `best ${industry} ${primaryCity.toLowerCase()}`,
          searchVolume: 1500,
          difficulty: "Medium",
          intent: "commercial",
          localVariations: [`${industry} in ${primaryCity}`, `${industry} near me`],
        },
        {
          keyword: `${industry} consultation ${primaryCity.toLowerCase()}`,
          searchVolume: 600,
          difficulty: "Low",
          intent: "commercial",
          localVariations: [`consultation near me`, `${industry} advice ${primaryCity}`],
        },
        {
          keyword: `emergency ${industry} services`,
          searchVolume: 800,
          difficulty: "High",
          intent: "transactional",
          localVariations: [`emergency ${industry} ${primaryCity}`, `urgent ${industry} care`],
        },
        {
          keyword: `${industry} treatment options`,
          searchVolume: 1200,
          difficulty: "Medium",
          intent: "informational",
          localVariations: [`treatment ${primaryCity}`, `${industry} therapy near me`],
        },
        {
          keyword: `affordable ${industry} ${primaryCity.toLowerCase()}`,
          searchVolume: 400,
          difficulty: "Low",
          intent: "commercial",
          localVariations: [`cheap ${industry}`, `low cost ${industry}`],
        },
      ],
    },
    technology: {
      current: [
        {
          keyword: `${industry} solutions ${primaryState.toLowerCase()}`,
          position: 20,
          searchVolume: 2000,
          difficulty: "High",
        },
        {
          keyword: `${account.name?.toLowerCase().replace(/\s+/g, " ")}`,
          position: 5,
          searchVolume: 300,
          difficulty: "Low",
        },
        { keyword: `IT services ${primaryCity.toLowerCase()}`, position: 15, searchVolume: 1500, difficulty: "Medium" },
        { keyword: `software development company`, position: 30, searchVolume: 3000, difficulty: "High" },
        {
          keyword: `tech consulting ${primaryState.toLowerCase()}`,
          position: 22,
          searchVolume: 800,
          difficulty: "Medium",
        },
      ],
      opportunities: [
        {
          keyword: `best IT company ${primaryCity.toLowerCase()}`,
          searchVolume: 1200,
          difficulty: "Medium",
          intent: "commercial",
          localVariations: [`IT services in ${primaryCity}`, `technology company near me`],
        },
        {
          keyword: `custom software development`,
          searchVolume: 2500,
          difficulty: "High",
          intent: "commercial",
          localVariations: [`software development ${primaryCity}`, `custom apps near me`],
        },
        {
          keyword: `cloud migration services`,
          searchVolume: 1800,
          difficulty: "Medium",
          intent: "commercial",
          localVariations: [`cloud services ${primaryCity}`, `cloud consulting near me`],
        },
        {
          keyword: `cybersecurity solutions`,
          searchVolume: 2200,
          difficulty: "High",
          intent: "commercial",
          localVariations: [`cybersecurity ${primaryCity}`, `IT security near me`],
        },
        {
          keyword: `managed IT services`,
          searchVolume: 1600,
          difficulty: "Medium",
          intent: "commercial",
          localVariations: [`managed IT ${primaryCity}`, `IT support near me`],
        },
      ],
    },
    default: {
      current: [
        {
          keyword: `${industry} services ${primaryState.toLowerCase()}`,
          position: 18,
          searchVolume: 1000,
          difficulty: "Medium",
        },
        {
          keyword: `${account.name?.toLowerCase().replace(/\s+/g, " ")}`,
          position: 8,
          searchVolume: 200,
          difficulty: "Low",
        },
        {
          keyword: `professional ${industry} ${primaryCity.toLowerCase()}`,
          position: 25,
          searchVolume: 600,
          difficulty: "Medium",
        },
        { keyword: `${industry} company near me`, position: 20, searchVolume: 800, difficulty: "Medium" },
        {
          keyword: `best ${industry} ${primaryState.toLowerCase()}`,
          position: 35,
          searchVolume: 1200,
          difficulty: "High",
        },
      ],
      opportunities: [
        {
          keyword: `top ${industry} ${primaryCity.toLowerCase()}`,
          searchVolume: 900,
          difficulty: "Medium",
          intent: "commercial",
          localVariations: [`${industry} in ${primaryCity}`, `${industry} near me`],
        },
        {
          keyword: `${industry} consultation`,
          searchVolume: 700,
          difficulty: "Low",
          intent: "commercial",
          localVariations: [`consultation ${primaryCity}`, `${industry} advice near me`],
        },
        {
          keyword: `affordable ${industry} services`,
          searchVolume: 500,
          difficulty: "Low",
          intent: "commercial",
          localVariations: [`cheap ${industry}`, `budget ${industry}`],
        },
        {
          keyword: `${industry} solutions`,
          searchVolume: 1100,
          difficulty: "Medium",
          intent: "informational",
          localVariations: [`solutions ${primaryCity}`, `${industry} help near me`],
        },
        {
          keyword: `${industry} expert ${primaryCity.toLowerCase()}`,
          searchVolume: 400,
          difficulty: "Low",
          intent: "commercial",
          localVariations: [`${industry} specialist`, `expert near me`],
        },
      ],
    },
  }

  const keywordSet = industryKeywords[industry as keyof typeof industryKeywords] || industryKeywords.default

  return {
    currentRankings: keywordSet.current,
    opportunities: keywordSet.opportunities,
    competitorGaps: [
      {
        keyword: `${industry} reviews ${primaryCity.toLowerCase()}`,
        competitors: ["competitor1.com", "competitor2.com"],
        opportunity: "High",
      },
      {
        keyword: `${industry} pricing ${primaryState.toLowerCase()}`,
        competitors: ["competitor3.com"],
        opportunity: "Medium",
      },
    ],
  }
}
