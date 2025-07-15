import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }

    // Ensure all accounts have safe default values
    const safeAccounts = accounts.map((account) => ({
      ...account,
      name: account.name || "Unnamed Account",
      industry: account.industry || "Unknown",
      monthly_post_count: account.monthly_post_count || 2,
      logo_url: account.logo_url || `/placeholder.svg?height=40&width=40&text=${account.name?.charAt(0) || "A"}`,
      website_url: account.website_url || "",
    }))

    return NextResponse.json(safeAccounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Prepare the account data with safe defaults
    const accountData = {
      name: body.name || "Unnamed Account",
      website_url: body.website_url || "",
      industry: body.industry || "",
      description: body.description || "",
      goals: body.goals || "",
      target_audience: body.target_audience || "",
      tone: body.tone || "professional",
      color_scheme: body.color_scheme || "",
      monthly_post_count: body.monthly_post_count || 2,
      keywords: body.keywords || "",
      text_length: body.text_length || 150,
      use_emojis: body.use_emojis !== undefined ? body.use_emojis : true,
      website_analysis: body.website_analysis || "",
      products: body.products || "",
      expertise: body.expertise || "",
      blog_topics: body.blog_topics || "",
      company_values: body.company_values || "",
      client_types: body.client_types || "",
      visual_style: body.visual_style || "",
      image_style: body.image_style || "corporate_professional",
      design_elements: body.design_elements || "",
      brand_personality: body.brand_personality || "",
      layout_style: body.layout_style || "",
      facebook_url: body.facebook_url || "",
      instagram_url: body.instagram_url || "",
      youtube_url: body.youtube_url || "",
      twitter_url: body.twitter_url || "",
      linkedin_url: body.linkedin_url || "",
      service_locations: body.service_locations || [],
      target_regions: body.target_regions || [],
      location_strategy: body.location_strategy || "local",
      primary_location: body.primary_location || { city: "", state: "", country: "United States" },
      monthly_blog_count: body.monthly_blog_count || 2,
      logo_url: body.logo_url || `/placeholder.svg?height=40&width=40&text=${body.name?.charAt(0) || "A"}`,
    }

    const { data: account, error } = await supabase.from("accounts").insert([accountData]).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
