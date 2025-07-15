"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Download, Wand2, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { TrendingTopics } from "./trending-topics"
import { PostEditModal } from "./post-edit-modal"
import { ImagePreviewModal } from "./image-preview-modal"

interface Post {
  id: string
  content: string
  hashtags: string[] | string
  image_url?: string
  image_prompt?: string
  created_at: string
  status: "draft" | "published"
}

interface SocialMediaTabProps {
  accountId: string
  account: any
}

export function SocialMediaTab({ accountId, account }: SocialMediaTabProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [postCount, setPostCount] = useState(1)
  const [imageFormat, setImageFormat] = useState("square")
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; prompt?: string } | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [accountId])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePosts = async (trendingTopic?: any) => {
    setGenerating(true)
    try {
      console.log("Generating posts with:", { trendingTopic, postCount, imageFormat })

      const endpoint = `/api/accounts/${accountId}/generate-posts`
      const body = {
        count: trendingTopic ? 1 : postCount,
        aspectRatio: imageFormat,
        ...(trendingTopic && { trendingTopic }),
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const newPosts = await response.json()
        console.log("Generated posts:", newPosts)
        await fetchPosts() // Refresh the posts list
      } else {
        const errorData = await response.json()
        console.error("Failed to generate posts:", errorData)
      }
    } catch (error) {
      console.error("Error generating posts:", error)
    } finally {
      setGenerating(false)
    }
  }

  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const exportPosts = () => {
    const csvContent = [
      ["Content", "Hashtags", "Status", "Created Date"].join(","),
      ...posts.map((post) => [
        `"${post.content.replace(/"/g, '""')}"`,
        `"${Array.isArray(post.hashtags) ? post.hashtags.join(" ") : post.hashtags}"`,
        post.status,
        new Date(post.created_at).toLocaleDateString(),
      ]),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${account?.name || "posts"}-social-media-posts.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatHashtags = (hashtags: string[] | string): string => {
    if (Array.isArray(hashtags)) {
      return hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")
    }
    if (typeof hashtags === "string") {
      return hashtags
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
        .join(" ")
    }
    return ""
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Recently created"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Recently created"
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Content Generation</CardTitle>
          <CardDescription>Generate AI-powered social media posts for {account?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Number of posts to generate: {postCount}</label>
              <Slider
                value={[postCount]}
                onValueChange={(value) => setPostCount(value[0])}
                max={10}
                min={1}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 post</span>
                <span>10 posts</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Image Format</label>
              <Select value={imageFormat} onValueChange={setImageFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="horizontal">Horizontal (16:9)</SelectItem>
                  <SelectItem value="vertical">Vertical (9:16)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => generatePosts()} disabled={generating} className="flex-1">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {postCount} Post{postCount > 1 ? "s" : ""}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={exportPosts} disabled={posts.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <TrendingTopics accountId={accountId} onGeneratePost={generatePosts} generating={generating} />

      {/* Generated Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Posts</CardTitle>
              <CardDescription>AI-generated social media content ready for publishing</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPosts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPost(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {post.image_url && (
                    <div className="relative group">
                      <img
                        src={post.image_url || "/placeholder.svg"}
                        alt="Post image"
                        className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage({ url: post.image_url!, prompt: post.image_prompt })}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          console.error("Image failed to load:", post.image_url)
                          target.src = `/placeholder.svg?height=128&width=256&query=${encodeURIComponent(
                            post.content.slice(0, 50),
                          )}`
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setPreviewImage({ url: post.image_url!, prompt: post.image_prompt })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <p className="text-xs text-blue-600 line-clamp-2">{formatHashtags(post.hashtags)}</p>
                  </div>

                  <p className="text-xs text-gray-500">Created {formatDate(post.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts generated yet</h3>
              <p className="text-gray-600 mb-4">Generate your first batch of AI-powered social media posts</p>
              <Button onClick={() => generatePosts()}>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Posts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {editingPost && (
        <PostEditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(updatedPost) => {
            setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
            setEditingPost(null)
          }}
        />
      )}

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          prompt={previewImage.prompt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}
