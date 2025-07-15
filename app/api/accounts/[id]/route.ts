import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data: account, error } = await supabase.from("accounts").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Ensure all required fields have default values
    const safeAccount = {
      ...account,
      name: account.name || "Unnamed Account",
      website_url: account.website_url || "",
      industry: account.industry || "",
      description: account.description || "",
      goals: account.goals || "",
      target_audience: account.target_audience || "",
      tone: account.tone || "professional",
      color_scheme: account.color_scheme || "",
      monthly_post_count: account.monthly_post_count || 2,
      keywords: account.keywords || "",
      text_length: account.text_length || 150,
      use_emojis: account.use_emojis !== undefined ? account.use_emojis : true,
      website_analysis: account.website_analysis || "",
      products: account.products || "",
      expertise: account.expertise || "",
      blog_topics: account.blog_topics || "",
      company_values: account.company_values || "",
      client_types: account.client_types || "",
      visual_style: account.visual_style || "",
      image_style: account.image_style || "corporate_professional",
      design_elements: account.design_elements || "",
      brand_personality: account.brand_personality || "",
      layout_style: account.layout_style || "",
      facebook_url: account.facebook_url || "",
      instagram_url: account.instagram_url || "",
      youtube_url: account.youtube_url || "",
      twitter_url: account.twitter_url || "",
      linkedin_url: account.linkedin_url || "",
      service_locations: account.service_locations || [],
      target_regions: account.target_regions || [],
      location_strategy: account.location_strategy || "local",
      primary_location: account.primary_location || { city: "", state: "", country: "United States" },
      monthly_blog_count: account.monthly_blog_count || 2,
      logo_url: account.logo_url || `/placeholder.svg?height=40&width=40&text=${account.name?.charAt(0) || "A"}`,
      // Transform content_pillars if it's a string
      content_pillars:
        typeof account.content_pillars === "string"
          ? account.content_pillars
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean)
          : account.content_pillars || [],
      // Transform posting_frequency
      posting_frequency: account.monthly_post_count
        ? `${account.monthly_post_count} posts per month`
        : "2 posts per month",
      // Transform brand_voice
      brand_voice: account.tone || "professional",
      // Transform social_media_urls
      social_media_urls: {
        instagram: account.instagram_url || "",
        facebook: account.facebook_url || "",
        twitter: account.twitter_url || "",
        linkedin: account.linkedin_url || "",
        youtube: account.youtube_url || "",
        tiktok: account.tiktok_url || "",
      },
      // Transform visual_style object
      visual_style_obj: {
        primary_colors: account.color_scheme ? account.color_scheme.split(",").map((c: string) => c.trim()) : [],
        secondary_colors: [],
        fonts: [],
        imagery_style: account.image_style || "corporate_professional",
        logo_style: account.design_elements || "",
      },
      // Transform service locations
      serviceLocations: account.service_locations || [],
      targetRegions: account.target_regions || [],
      locationStrategy: account.location_strategy || "local",
    }

    return NextResponse.json(safeAccount)
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Remove fields that don't exist in the database schema
    const {
      id,
      created_at,
      updated_at,
      content_pillars,
      posting_frequency,
      brand_voice,
      social_media_urls,
      visual_style_obj,
      serviceLocations,
      targetRegions,
      locationStrategy,
      ...updateData
    } = body

    // Only include fields that exist in the database
    const safeUpdateData = {
      name: updateData.name || "",
      website_url: updateData.website_url || "",
      industry: updateData.industry || "",
      description: updateData.description || "",
      goals: updateData.goals || "",
      target_audience: updateData.target_audience || "",
      tone: updateData.tone || body.brand_voice || "professional",
      color_scheme: updateData.color_scheme || "",
      monthly_post_count: updateData.monthly_post_count || 2,
      keywords: updateData.keywords || "",
      text_length: updateData.text_length || 150,
      use_emojis: updateData.use_emojis !== undefined ? updateData.use_emojis : true,
      website_analysis: updateData.website_analysis || "",
      products: updateData.products || "",
      expertise: updateData.expertise || "",
      blog_topics: updateData.blog_topics || "",
      company_values: updateData.company_values || "",
      client_types: updateData.client_types || "",
      visual_style: updateData.visual_style || "",
      image_style: updateData.image_style || "corporate_professional",
      design_elements: updateData.design_elements || "",
      brand_personality: updateData.brand_personality || "",
      layout_style: updateData.layout_style || "",
      facebook_url: updateData.facebook_url || body.social_media_urls?.facebook || "",
      instagram_url: updateData.instagram_url || body.social_media_urls?.instagram || "",
      youtube_url: updateData.youtube_url || body.social_media_urls?.youtube || "",
      twitter_url: updateData.twitter_url || body.social_media_urls?.twitter || "",
      linkedin_url: updateData.linkedin_url || body.social_media_urls?.linkedin || "",
      service_locations: updateData.service_locations || body.serviceLocations || [],
      target_regions: updateData.target_regions || body.targetRegions || [],
      location_strategy: updateData.location_strategy || body.locationStrategy || "local",
      primary_location: updateData.primary_location || { city: "", state: "", country: "United States" },
      monthly_blog_count: updateData.monthly_blog_count || 2,
      logo_url: updateData.logo_url || "",
    }

    const { data: account, error } = await supabase
      .from("accounts")
      .update(safeUpdateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    console.log(`Attempting to delete account: ${params.id}`)

    // First, delete all related posts
    const { error: postsError } = await supabase.from("posts").delete().eq("account_id", params.id)

    if (postsError) {
      console.error("Error deleting posts:", postsError)
      // Continue with account deletion even if posts deletion fails
    } else {
      console.log("Successfully deleted posts for account")
    }

    // Delete all related blogs
    const { error: blogsError } = await supabase.from("blogs").delete().eq("account_id", params.id)

    if (blogsError) {
      console.error("Error deleting blogs:", blogsError)
      // Continue with account deletion even if blogs deletion fails
    } else {
      console.log("Successfully deleted blogs for account")
    }

    // Finally, delete the account
    const { error: accountError } = await supabase.from("accounts").delete().eq("id", params.id)

    if (accountError) {
      console.error("Error deleting account:", accountError)
      return NextResponse.json(
        {
          error: "Failed to delete account",
          details: accountError.message,
        },
        { status: 500 },
      )
    }

    console.log("Successfully deleted account")
    return NextResponse.json({
      success: true,
      message: "Account and all related data deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE /api/accounts/[id]:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
