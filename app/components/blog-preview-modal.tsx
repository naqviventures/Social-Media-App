"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Download, Copy } from "lucide-react"

interface Blog {
  id: string
  title: string
  content: string
  metaDescription?: string
  secondaryKeywords?: string[]
  status: "draft" | "scheduled" | "published"
  createdAt: string
  wordCount?: number
}

interface BlogPreviewModalProps {
  blog: Blog
  onClose: () => void
}

export function BlogPreviewModal({ blog, onClose }: BlogPreviewModalProps) {
  const copyToClipboard = () => {
    if (blog.content) {
      navigator.clipboard.writeText(blog.content)
    }
  }

  const downloadBlog = () => {
    if (!blog.content) return

    const element = document.createElement("a")
    const file = new Blob([blog.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${(blog.title || "blog").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl mb-2">{blog.title || "Untitled Blog"}</DialogTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status || "draft"}</Badge>
                <span className="text-sm text-gray-500">
                  Created {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Unknown date"}
                </span>
                {blog.wordCount && <span className="text-sm text-gray-500">• {blog.wordCount} words</span>}
              </div>
              {blog.secondaryKeywords && Array.isArray(blog.secondaryKeywords) && blog.secondaryKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {blog.secondaryKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!blog.content}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBlog} disabled={!blog.content}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="prose prose-sm max-w-none pr-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{blog.content || "No content available"}</div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
