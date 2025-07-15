"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SocialMediaTab } from "@/app/components/social-media-tab"
import { SeoTab } from "@/app/components/seo-blog-tab"
import { DisplayBannerTab } from "@/app/components/display-banner-tab"
import { LandingPageTab } from "@/app/components/landing-page-tab"

interface Account {
  id: string
  name: string
  website_url: string
  industry: string
  business_description: string
  target_audience: string
  tone: string
  color_primary: string
  color_secondary: string
  keywords: string
  monthly_post_target: number
  created_at: string
}

export default function AccountPage() {
  const params = useParams()
  const accountId = params.id as string
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`/api/accounts/${accountId}`)
        if (response.ok) {
          const data = await response.json()
          setAccount(data)
        }
      } catch (error) {
        console.error("Error fetching account:", error)
      } finally {
        setLoading(false)
      }
    }

    if (accountId) {
      fetchAccount()
    }
  }, [accountId])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account not found</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-gray-600">{account.website_url}</p>
          </div>
        </div>
        <Link href={`/accounts/${accountId}/settings`}>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{account.industry}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{account.target_audience || "Not specified"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Brand Tone</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{account.tone || "Professional"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{account.monthly_post_target || 0}</p>
            <p className="text-xs text-gray-500">posts per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="social-media" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="seo-blogs">SEO Blogs</TabsTrigger>
          <TabsTrigger value="display-banners">Display Banners</TabsTrigger>
          <TabsTrigger value="landing-page">Landing Page</TabsTrigger>
        </TabsList>

        <TabsContent value="social-media">
          <SocialMediaTab accountId={accountId} account={account} />
        </TabsContent>

        <TabsContent value="seo-blogs">
          <SeoTab accountId={accountId} account={account} />
        </TabsContent>

        <TabsContent value="display-banners">
          <DisplayBannerTab accountId={accountId} account={account} />
        </TabsContent>

        <TabsContent value="landing-page">
          <LandingPageTab accountId={accountId} account={account} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
