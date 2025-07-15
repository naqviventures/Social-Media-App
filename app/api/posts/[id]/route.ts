import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Updating post with data:", body) // Debug log

    const { data: post, error } = await supabase
      .from("posts")
      .update({
        content: body.content,
        hashtags: body.hashtags || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    // If database tables don't exist, return success (fallback mode)
    if (error && error.message?.includes("does not exist")) {
      console.log("Database not configured - update not persisted")
      return NextResponse.json({ success: true, message: "Database not configured - update not persisted" })
    }

    if (error) {
      console.error("Error updating post:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Failed to update post",
          details: error.message,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("Post updated successfully:", post)
    return NextResponse.json(post)
  } catch (error) {
    console.error("Error in PUT /api/posts/[id]:", error)
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
    const { error } = await supabase.from("posts").delete().eq("id", params.id)

    // If database tables don't exist, return success (fallback mode)
    if (error && error.message?.includes("does not exist")) {
      return NextResponse.json({ success: true, message: "Database not configured - deletion not persisted" })
    }

    if (error) {
      console.error("Error deleting post:", error)
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
