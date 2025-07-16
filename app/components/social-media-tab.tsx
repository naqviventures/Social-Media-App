"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download, Wand2, Eye, Edit, Trash2, Loader2, ImageIcon, Video } from "lucide-react"
import { TrendingTopics } from "./trending-topics"
import { PostEditModal } from "./post-edit-modal"
import { ImagePreviewModal } from "./image-preview-modal"

interface Post {
  id: string
  content: string
  hashtags: string[] | string
  image_url?: string
  video_url?: string
  image_prompt?: string
  created_at: string
  status: "draft" | "published"
  media_type?: "image" | "video"
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
  const [mediaFormat, setMediaFormat] = useState("square")
  const [generateVideo, setGenerateVideo] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
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
      console.log("Generating posts with:", {
        trendingTopic,
        postCount,
        mediaFormat,
        generateVideo,
        customPrompt,
      })

      const endpoint = `/api/accounts/${accountId}/generate-posts`
      const body = {
        count: trendingTopic ? 1 : postCount,
        aspectRatio: mediaFormat,
        mediaType: generateVideo ? "video" : "image",
        customPrompt: customPrompt.trim(),
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
      ["Content", "Hashtags", "Status", "Media Type", "Created Date"].join(","),
      ...posts.map((post) => [
        `"${post.content.replace(/"/g, '""')}"`,
        `"${Array.isArray(post.hashtags) ? post.hashtags.join(" ") : post.hashtags}"`,
        post.status,
        post.media_type || "image",
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
              <label className="text-sm font-medium mb-2 block">{generateVideo ? "Video" : "Image"} Format</label>
              <Select value={mediaFormat} onValueChange={setMediaFormat}>
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

          {/* Media Type Toggle */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-gray-600" />
              <Label htmlFor="media-toggle" className="text-sm font-medium">
                Photo
              </Label>
            </div>
            <Switch id="media-toggle" checked={generateVideo} onCheckedChange={setGenerateVideo} />
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-gray-600" />
              <Label htmlFor="media-toggle" className="text-sm font-medium">
                Video
              </Label>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt" className="text-sm font-medium">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="custom-prompt"
              placeholder="Describe specific elements you want to see in the post (e.g., 'Include a person using a laptop', 'Show a modern office setting', 'Feature bright colors and energetic mood')..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-gray-500">
              This will be combined with your business information and brand settings to create targeted content.
            </p>
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
                  Generate {postCount} {generateVideo ? "Video" : "Photo"} Post{postCount > 1 ? "s" : ""}
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={exportPosts} disabled={posts.length === 0}>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                      {post.media_type === "video" && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPost(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(post.image_url || post.video_url) && (
                    <div className="relative group">
                      {post.media_type === "video" && post.video_url ? (
                        <video
                          src={post.video_url}
                          className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          controls
                          muted
                          preload="metadata"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement
                            console.error("Video failed to load:", post.video_url)
                            // Hide the video element if it fails to load
                            target.style.display = "none"
                            // Show a fallback message
                            const fallback = document.createElement("div")
                            fallback.className =
                              "w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm"
                            fallback.innerHTML =
                              '<div class="text-center"><svg class="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 000 2h8a1 1 0 100-2H5z"/></svg>Video processing...</div>'
                            target.parentNode?.appendChild(fallback)
                          }}
                          onLoadStart={() => {
                            console.log("Video loading started:", post.video_url)
                          }}
                          onCanPlay={() => {
                            console.log("Video can play:", post.video_url)
                          }}
                        />
                      ) : (
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
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (post.media_type === "video" && post.video_url) {
                            // Open video in new tab for full view
                            window.open(post.video_url, "_blank")
                          } else {
                            setPreviewImage({ url: post.image_url!, prompt: post.image_prompt })
                          }
                        }}
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
