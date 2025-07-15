"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, Grid, List, MoreVertical, ExternalLink, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Social Media Icons
const FacebookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const YouTubeIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const TikTokIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

interface Account {
  id: string
  name: string
  industry: string
  monthly_post_count: number
  logo_url?: string
  website_url: string
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  linkedin_url?: string
  youtube_url?: string
  tiktok_url?: string
}

interface AccountStats {
  monthlyTarget: number
  thisMonth: number
  totalPosts: number
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountStats, setAccountStats] = useState<Record<string, AccountStats>>({})
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)

        // Fetch stats for each account
        const statsPromises = data.map(async (account: Account) => {
          try {
            const [postsResponse, blogsResponse] = await Promise.all([
              fetch(`/api/accounts/${account.id}/posts`),
              fetch(`/api/accounts/${account.id}/blogs`),
            ])

            const posts = postsResponse.ok ? await postsResponse.json() : []
            const blogs = blogsResponse.ok ? await blogsResponse.json() : []

            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            const thisMonthPosts = posts.filter((post: any) => {
              const postDate = new Date(post.created_at)
              return postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear
            }).length

            const thisMonthBlogs = blogs.filter((blog: any) => {
              const blogDate = new Date(blog.created_at)
              return blogDate.getMonth() === currentMonth && blogDate.getFullYear() === currentYear
            }).length

            return {
              accountId: account.id,
              stats: {
                monthlyTarget: account.monthly_post_count || 2,
                thisMonth: thisMonthPosts + thisMonthBlogs,
                totalPosts: posts.length + blogs.length,
              },
            }
          } catch (error) {
            console.error(`Error fetching stats for account ${account.id}:`, error)
            return {
              accountId: account.id,
              stats: {
                monthlyTarget: account.monthly_post_count || 2,
                thisMonth: 0,
                totalPosts: 0,
              },
            }
          }
        })

        const statsResults = await Promise.all(statsPromises)
        const statsMap = statsResults.reduce(
          (acc, { accountId, stats }) => {
            acc[accountId] = stats
            return acc
          },
          {} as Record<string, AccountStats>,
        )

        setAccountStats(statsMap)
      } else {
        console.error("Failed to fetch accounts")
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const getSocialMediaLinks = (account: Account) => {
    const links = []
    if (account.facebook_url) links.push({ icon: FacebookIcon, url: account.facebook_url, name: "Facebook" })
    if (account.instagram_url) links.push({ icon: InstagramIcon, url: account.instagram_url, name: "Instagram" })
    if (account.twitter_url) links.push({ icon: TwitterIcon, url: account.twitter_url, name: "Twitter" })
    if (account.linkedin_url) links.push({ icon: LinkedInIcon, url: account.linkedin_url, name: "LinkedIn" })
    if (account.youtube_url) links.push({ icon: YouTubeIcon, url: account.youtube_url, name: "YouTube" })
    if (account.tiktok_url) links.push({ icon: TikTokIcon, url: account.tiktok_url, name: "TikTok" })
    return links
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 mx-6 mt-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Database Connected!</h3>
            <div className="mt-1 text-sm text-green-700">
              Your Supabase database is now active. All data will be persisted and the app is fully functional.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Media Content Manager</h1>
            <p className="text-gray-600 mt-2">Manage your clients' social media content with AI-powered generation</p>
          </div>
          <Link href="/new-account">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </Link>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>

        {/* Accounts Display */}
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Users className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first client account</p>
            <Link href="/new-account">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {accounts.map((account) => {
              const stats = accountStats[account.id] || { monthlyTarget: 2, thisMonth: 0, totalPosts: 0 }
              const progressPercentage = getProgressPercentage(stats.thisMonth, stats.monthlyTarget)
              const socialLinks = getSocialMediaLinks(account)

              return (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={account.logo_url || "/placeholder.svg"} alt={`${account.name} logo`} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {account.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{account.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {account.industry}
                            </Badge>
                            {account.website_url && (
                              <a
                                href={account.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Globe className="h-3 w-3 mr-1" />
                                {account.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                          {socialLinks.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              {socialLinks.map((social, index) => (
                                <a
                                  key={index}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-gray-800 transition-colors"
                                  title={social.name}
                                >
                                  <social.icon />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
                          <div className="text-xs text-gray-500">This Month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.totalPosts}</div>
                          <div className="text-xs text-gray-500">Total Posts</div>
                        </div>
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/accounts/${account.id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem asChild>
                                <Link href={`/accounts/${account.id}/settings`}>Settings</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const stats = accountStats[account.id] || { monthlyTarget: 2, thisMonth: 0, totalPosts: 0 }
              const progressPercentage = getProgressPercentage(stats.thisMonth, stats.monthlyTarget)
              const socialLinks = getSocialMediaLinks(account)

              return (
                <Link key={account.id} href={`/accounts/${account.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={account.logo_url || "/placeholder.svg"} alt={`${account.name} logo`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {account.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{account.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {account.industry}
                            </Badge>
                          </div>
                        </div>
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>

                      {/* Website Link */}
                      {account.website_url && (
                        <div className="mt-2">
                          <a
                            href={account.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {account.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}

                      {/* Social Media Links */}
                      {socialLinks.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {socialLinks.map((social, index) => (
                            <a
                              key={index}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title={social.name}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <social.icon />
                            </a>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Monthly Target</span>
                          <span className="font-semibold">{stats.monthlyTarget} posts</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">This Month</span>
                          <span className="font-semibold text-blue-600">{stats.thisMonth} posts</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Posts</span>
                          <span className="font-semibold text-green-600">{stats.totalPosts} posts</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
