"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Search, Download, Eye, Edit, Trash2, TrendingUp, Loader2, FileText } from "lucide-react"
import { BlogPreviewModal } from "./blog-preview-modal"
import { BlogEditModal } from "./blog-edit-modal"

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

interface KeywordData {
  currentRankings: Array<{
    keyword: string
    position: number
    searchVolume: number
    difficulty: string
  }>
  opportunities: Array<{
    keyword: string
    searchVolume: number
    difficulty: string
    intent: string
    localVariations: string[]
  }>
  competitorGaps: Array<{
    keyword: string
    competitors: string[]
    opportunity: string
  }>
}

interface SeoTabProps {
  accountId: string
  account: any
}

export function SeoTab({ accountId, account }: SeoTabProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [blogCount, setBlogCount] = useState(2)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)

  useEffect(() => {
    fetchBlogs()
    analyzeKeywords()
  }, [accountId])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/blogs`)
      if (response.ok) {
        const data = await response.json()
        setBlogs(data)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeKeywords = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/analyze-keywords`, {
        method: "POST",
      })
      if (response.ok) {
        const data = await response.json()
        setKeywordData(data)
      }
    } catch (error) {
      console.error("Error analyzing keywords:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const generateBlogs = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/generate-blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: blogCount,
          targetKeywords: selectedKeywords.length > 0 ? selectedKeywords : undefined,
          keywordData,
        }),
      })

      if (response.ok) {
        const newBlogs = await response.json()
        setBlogs([...newBlogs, ...blogs])
      }
    } catch (error) {
      console.error("Error generating blogs:", error)
    } finally {
      setGenerating(false)
    }
  }

  const deleteBlog = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setBlogs(blogs.filter((blog) => blog.id !== blogId))
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
    }
  }

  const exportBlogs = () => {
    const csvContent = [
      ["Title", "Meta Description", "Target Keyword", "Word Count", "Status", "Created Date"].join(","),
      ...blogs.map((blog) => [
        `"${blog.title?.replace(/"/g, '""') || ""}"`,
        `"${blog.metaDescription?.replace(/"/g, '""') || ""}"`,
        `"${blog.targetKeyword || ""}"`,
        blog.wordCount || 0,
        blog.status,
        new Date(blog.createdAt).toLocaleDateString(),
      ]),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${account?.name || "blogs"}-seo-blog-posts.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  return (
    <div className="space-y-6">
      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SEO Keyword Analysis
              </CardTitle>
              <CardDescription>
                AI-analyzed keyword opportunities for {account?.name} based on industry and location
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={analyzeKeywords} disabled={analyzing}>
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {analyzing ? "Analyzing..." : "Refresh Analysis"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {analyzing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Analyzing keywords...</span>
            </div>
          ) : keywordData ? (
            <div className="space-y-6">
              {/* Current Rankings */}
              {keywordData.currentRankings && keywordData.currentRankings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Rankings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {keywordData.currentRankings.slice(0, 6).map((ranking, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{ranking.keyword}</h4>
                          <Badge variant="outline" className="text-xs">
                            #{ranking.position}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span className="font-medium">{ranking.searchVolume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Difficulty:</span>
                            <span className={`font-medium ${getDifficultyColor(ranking.difficulty)}`}>
                              {ranking.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Opportunities */}
              {keywordData.opportunities && keywordData.opportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Keyword Opportunities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {keywordData.opportunities.slice(0, 9).map((opportunity, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-colors ${
                          selectedKeywords.includes(opportunity.keyword)
                            ? "border-blue-500 bg-blue-50"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() => toggleKeywordSelection(opportunity.keyword)}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{opportunity.keyword}</h4>
                          <Badge className={getDifficultyColor(opportunity.difficulty)}>{opportunity.difficulty}</Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span className="font-medium">{opportunity.searchVolume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Intent:</span>
                            <span className="font-medium capitalize">{opportunity.intent}</span>
                          </div>
                        </div>
                        {opportunity.localVariations && opportunity.localVariations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {opportunity.localVariations.slice(0, 2).map((variation, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {variation}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedKeywords.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Selected {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? "s" : ""} for blog
                        generation
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No keyword analysis available</h3>
              <p className="text-gray-600 mb-4">Click "Refresh Analysis" to analyze keywords for this account</p>
              <Button onClick={analyzeKeywords}>
                <Search className="h-4 w-4 mr-2" />
                Analyze Keywords
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Blog Generation</CardTitle>
              <CardDescription>Generate SEO-optimized blog posts based on keyword opportunities</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateBlogs} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate {blogCount} Blog{blogCount > 1 ? "s" : ""}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={exportBlogs} disabled={blogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Number of blogs to generate: {blogCount}</label>
              <Slider
                value={[blogCount]}
                onValueChange={(value) => setBlogCount(value[0])}
                max={10}
                min={1}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 blog</span>
                <span>10 blogs</span>
              </div>
            </div>
          </div>

          {selectedKeywords.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Will generate blogs targeting these keywords:</p>
              <div className="flex flex-wrap gap-1">
                {selectedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Blogs */}
      <Card>
        <CardHeader>
          <CardTitle>Generated SEO Blogs</CardTitle>
          <CardDescription>AI-generated, SEO-optimized blog posts ready for publishing</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewBlog(blog)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingBlog(blog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBlog(blog.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{blog.metaDescription}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{blog.wordCount || 0} words</span>
                    <span>Created {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>

                  {blog.targetKeyword && (
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {blog.targetKeyword}
                      </Badge>
                      {blog.secondaryKeywords?.slice(0, 2).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs generated yet</h3>
              <p className="text-gray-600 mb-4">Generate SEO-optimized blog posts based on keyword opportunities</p>
              <Button onClick={generateBlogs}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Blogs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {previewBlog && <BlogPreviewModal blog={previewBlog} onClose={() => setPreviewBlog(null)} />}

      {editingBlog && (
        <BlogEditModal
          blog={editingBlog}
          onClose={() => setEditingBlog(null)}
          onSave={(updatedBlog) => {
            setBlogs(blogs.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)))
            setEditingBlog(null)
          }}
        />
      )}
    </div>
  )
}
