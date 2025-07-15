"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface Post {
  id: string
  content: string
  hashtags: string[]
  image_url?: string
  image_prompt?: string
  status: "draft" | "scheduled" | "published"
  created_at: string
}

interface PostEditModalProps {
  post: Post
  onClose: () => void
  onSave: (post: Post) => void
}

export function PostEditModal({ post, onClose, onSave }: PostEditModalProps) {
  const [content, setContent] = useState(post.content)
  const [hashtags, setHashtags] = useState(post.hashtags.join(", "))
  const [status, setStatus] = useState(post.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          hashtags: hashtags
            .split(",")
            .map((h) => h.trim().replace("#", ""))
            .filter(Boolean),
          status,
        }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        onSave(updatedPost)
      }
    } catch (error) {
      console.error("Error saving post:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Post</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {post.image_url && (
            <div>
              <img
                src={post.image_url || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post content"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="hashtag1, hashtag2, hashtag3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
