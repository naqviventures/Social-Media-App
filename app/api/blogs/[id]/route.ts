import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Updating blog with data:", body)

    const { data: blog, error } = await supabase
      .from("blogs")
      .update({
        title: body.title,
        slug: body.slug,
        content: body.content,
        meta_title: body.metaTitle,
        meta_description: body.metaDescription,
        target_keyword: body.targetKeyword,
        secondary_keywords: body.secondaryKeywords || [],
        word_count: body.wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error && error.message?.includes("does not exist")) {
      console.log("Database not configured - update not persisted")
      return NextResponse.json({ success: true, message: "Database not configured - update not persisted" })
    }

    if (error) {
      console.error("Error updating blog:", error)
      return NextResponse.json(
        {
          error: "Failed to update blog",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Blog updated successfully:", blog)
    return NextResponse.json(blog)
  } catch (error) {
    console.error("Error in PUT /api/blogs/[id]:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("blogs").delete().eq("id", params.id)

    if (error && error.message?.includes("does not exist")) {
      return NextResponse.json({ success: true, message: "Database not configured - deletion not persisted" })
    }

    if (error) {
      console.error("Error deleting blog:", error)
      return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/blogs/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
