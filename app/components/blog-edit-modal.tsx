"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface Blog {
  id: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  targetKeyword?: string
  secondaryKeywords?: string[]
  wordCount?: number
  status: "draft" | "scheduled" | "published"
  createdAt: string
}

interface BlogEditModalProps {
  blog: Blog
  onClose: () => void
  onSave: (blog: Blog) => void
}

export function BlogEditModal({ blog, onClose, onSave }: BlogEditModalProps) {
  const [title, setTitle] = useState(blog.title || "")
  const [content, setContent] = useState(blog.content || "")
  const [metaTitle, setMetaTitle] = useState(blog.metaTitle || "")
  const [metaDescription, setMetaDescription] = useState(blog.metaDescription || "")
  const [targetKeyword, setTargetKeyword] = useState(blog.targetKeyword || "")
  const [keywords, setKeywords] = useState(
    Array.isArray(blog.secondaryKeywords) ? blog.secondaryKeywords.join(", ") : "",
  )
  const [status, setStatus] = useState(blog.status || "draft")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          metaTitle,
          metaDescription,
          targetKeyword,
          secondaryKeywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          status,
          wordCount: content.split(/\s+/).filter((word) => word.length > 0).length,
        }),
      })

      if (response.ok) {
        const updatedBlog = await response.json()
        onSave({
          ...blog,
          ...updatedBlog,
          title,
          content,
          metaTitle,
          metaDescription,
          targetKeyword,
          secondaryKeywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          status,
        })
      }
    } catch (error) {
      console.error("Error saving blog:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Blog Post</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog post title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO meta title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO meta description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-keyword">Target Keyword</Label>
            <Input
              id="target-keyword"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="Primary target keyword"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Secondary Keywords</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
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

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Blog post content"
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
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
