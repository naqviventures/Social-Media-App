import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("account_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    // Transform the data to ensure proper formatting
    const transformedPosts = posts.map((post) => ({
      ...post,
      hashtags: Array.isArray(post.hashtags)
        ? post.hashtags
        : typeof post.hashtags === "string"
          ? post.hashtags.split(",").map((tag: string) => tag.trim())
          : [],
      created_at: post.created_at || new Date().toISOString(),
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Posts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
