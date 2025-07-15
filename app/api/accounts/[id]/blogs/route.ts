import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("account_id", params.id)
      .order("created_at", { ascending: false })

    // If database tables don't exist, return empty array
    if (error && error.message?.includes("does not exist")) {
      console.log("Blogs table not found, returning empty array")
      return NextResponse.json([])
    }

    if (error) {
      console.error("Error fetching blogs:", error)
      return NextResponse.json([])
    }

    // Transform database fields to match frontend expectations
    const transformedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      metaTitle: blog.meta_title,
      metaDescription: blog.meta_description,
      targetKeyword: blog.target_keyword,
      secondaryKeywords: blog.secondary_keywords || [],
      wordCount: blog.word_count,
      status: blog.status,
      publishedAt: blog.published_at,
      createdAt: blog.created_at,
    }))

    return NextResponse.json(transformedBlogs)
  } catch (error) {
    console.error("Error in GET /api/accounts/[id]/blogs:", error)
    return NextResponse.json([])
  }
}
