"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Upload, X, Globe, MapPin, Users, Palette, MessageSquare, Target, Loader2 } from "lucide-react"
import { SocialMediaTab } from "@/app/components/social-media-tab"
import { SeoTab } from "@/app/components/seo-blog-tab"
import DisplayBannerTab from "@/app/components/display-banner-tab"
import LocationManager from "@/app/components/location-manager"

interface Account {
  id: string
  name: string
  website_url?: string
  website_analysis?: string
  industry?: string
  business_description?: string
  goals_objectives?: string
  target_audience?: string
  brand_tone?: string
  color_scheme?: string
  keywords_hashtags?: string
  monthly_post_target?: number
  image_style?: string
  visual_style?: string
  brand_personality?: string
  design_elements?: string
  facebook_url?: string
  instagram_url?: string
  youtube_url?: string
  twitter_url?: string
  linkedin_url?: string
  text_length?: number
  include_emojis?: boolean
  products_services?: string
  areas_expertise?: string
  content_topics?: string
  company_values?: string
  client_types?: string
  location_strategy?: string
  primary_location?: string
  service_locations?: any[]
  target_regions?: any[]
  logo_url?: string
  background_image_url?: string
}

export default function AccountSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string

  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const fetchAccount = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`)
      if (response.ok) {
        const data = await response.json()
        setAccount(data)
      }
    } catch (error) {
      console.error("Failed to fetch account:", error)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  const updateAccount = useCallback(
    async (updates: Partial<Account>) => {
      if (!account) return

      const updatedAccount = { ...account, ...updates }
      setAccount(updatedAccount)

      try {
        await fetch(`/api/accounts/${accountId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      } catch (error) {
        console.error("Failed to update account:", error)
      }
    },
    [account, accountId],
  )

  const handleSave = async () => {
    if (!account) return

    setSaving(true)
    try {
      // Upload logo if selected
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("accountId", accountId)

        const logoResponse = await fetch("/api/upload-logo", {
          method: "POST",
          body: formData,
        })

        if (logoResponse.ok) {
          const logoData = await logoResponse.json()
          account.logo_url = logoData.url
        }
      }

      // Upload background image if selected
      if (backgroundFile) {
        const formData = new FormData()
        formData.append("file", backgroundFile)
        formData.append("accountId", accountId)

        const bgResponse = await fetch("/api/upload-background", {
          method: "POST",
          body: formData,
        })

        if (bgResponse.ok) {
          const bgData = await bgResponse.json()
          account.background_image_url = bgData.url
        }
      }

      // Save all account data
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
        setLogoFile(null)
        setBackgroundFile(null)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleLocationUpdate = useCallback(
    (locations: any) => {
      updateAccount({ service_locations: locations })
    },
    [updateAccount],
  )

  const analyzeWebsite = async () => {
    if (!account?.website_url) {
      alert("Please enter a website URL first")
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: account.website_url }),
      })

      if (response.ok) {
        const analysis = await response.json()

        // Auto-fill ALL form fields based on analysis
        updateAccount({
          business_description: analysis.description || account.business_description,
          industry: analysis.industry || account.industry,
          brand_tone: analysis.tone || account.brand_tone,
          color_scheme: analysis.colorScheme || account.color_scheme,
          keywords_hashtags: analysis.keywords || account.keywords_hashtags,
          target_audience: analysis.targetAudience || account.target_audience,
          goals_objectives: analysis.goals || account.goals_objectives,
          products_services: analysis.products || account.products_services,
          areas_expertise: analysis.expertise || account.areas_expertise,
          content_topics: analysis.blogTopics || account.content_topics,
          company_values: analysis.companyValues || account.company_values,
          client_types: analysis.clientTypes || account.client_types,
          brand_personality: analysis.brandPersonality || account.brand_personality,
          image_style: analysis.imageStyle || account.image_style,
          visual_style: analysis.visualStyle || account.visual_style,
          design_elements: analysis.designElements || account.design_elements,
          facebook_url: analysis.facebookUrl || account.facebook_url,
          instagram_url: analysis.instagramUrl || account.instagram_url,
          youtube_url: analysis.youtubeUrl || account.youtube_url,
          twitter_url: analysis.twitterUrl || account.twitter_url,
          linkedin_url: analysis.linkedinUrl || account.linkedin_url,
        })

        const socialMediaFound = [
          analysis.facebookUrl,
          analysis.instagramUrl,
          analysis.youtubeUrl,
          analysis.twitterUrl,
          analysis.linkedinUrl,
        ].filter(Boolean).length

        const fieldsPopulated = [
          analysis.description,
          analysis.industry,
          analysis.tone,
          analysis.goals,
          analysis.targetAudience,
          analysis.products,
          analysis.expertise,
          analysis.blogTopics,
          analysis.companyValues,
          analysis.clientTypes,
          analysis.brandPersonality,
          analysis.imageStyle,
          analysis.visualStyle,
          analysis.designElements,
        ].filter(Boolean).length

        const message = `Website analyzed successfully! ${fieldsPopulated} fields auto-filled${socialMediaFound > 0 ? ` and ${socialMediaFound} social media account(s) detected` : ""}.`

        alert(message)
      } else {
        const errorData = await response.json()
        alert(`Failed to analyze website: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error analyzing website:", error)
      alert("Failed to analyze website. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm(`Are you sure you want to delete ${account?.name}? This action cannot be undone.`)) {
      return
    }

    if (!confirm("This will permanently delete all posts, blogs, and settings. Are you absolutely sure?")) {
      return
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Account deleted successfully")
        router.push("/")
      } else {
        alert("Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!account) {
    return <div className="flex items-center justify-center min-h-screen">Account not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-gray-600">{account.name}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/accounts/${accountId}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              SEO/Blog
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Banners
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Client Name</Label>
                    <Input
                      id="name"
                      value={account.name || ""}
                      onChange={(e) => updateAccount({ name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="website"
                        value={account.website_url || ""}
                        onChange={(e) => updateAccount({ website_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                      <Button
                        type="button"
                        onClick={analyzeWebsite}
                        disabled={analyzing || !account.website_url}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click the globe icon to analyze and auto-fill form fields
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="analysis">Website Analysis</Label>
                  <Textarea
                    id="analysis"
                    value={account.website_analysis || ""}
                    onChange={(e) => updateAccount({ website_analysis: e.target.value })}
                    rows={3}
                    placeholder="Auto-generated summary to guide tone and brand voice"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={account.industry || ""}
                      onValueChange={(value) => updateAccount({ industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand-tone">Brand Tone</Label>
                    <Select
                      value={account.brand_tone || ""}
                      onValueChange={(value) => updateAccount({ brand_tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={account.business_description || ""}
                    onChange={(e) => updateAccount({ business_description: e.target.value })}
                    rows={3}
                    placeholder="Overview of what the client does"
                  />
                </div>

                <div>
                  <Label htmlFor="goals">Goals & Objectives</Label>
                  <Textarea
                    id="goals"
                    value={account.goals_objectives || ""}
                    onChange={(e) => updateAccount({ goals_objectives: e.target.value })}
                    rows={3}
                    placeholder="Strategic goal setting for content tone"
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Textarea
                    id="audience"
                    value={account.target_audience || ""}
                    onChange={(e) => updateAccount({ target_audience: e.target.value })}
                    rows={3}
                    placeholder="Personas the content is directed at"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                    <p className="text-sm text-gray-600">Permanently delete this account and all associated data</p>
                  </div>
                  <Button variant="destructive" onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Visual Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    {account.logo_url && (
                      <div className="relative">
                        <img
                          src={account.logo_url || "/placeholder.svg"}
                          alt="Logo"
                          className="w-20 h-20 rounded-lg object-contain border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => updateAccount({ logo_url: "" })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span>Upload Logo</span>
                        </div>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Image Upload */}
                <div>
                  <Label>Background Image</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    {account.background_image_url && (
                      <div className="relative">
                        <img
                          src={account.background_image_url || "/placeholder.svg"}
                          alt="Background"
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => updateAccount({ background_image_url: "" })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="bg-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span>Upload Background</span>
                        </div>
                      </Label>
                      <Input
                        id="bg-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="colors">Color Scheme</Label>
                  <Input
                    id="colors"
                    value={account.color_scheme || ""}
                    onChange={(e) => updateAccount({ color_scheme: e.target.value })}
                    placeholder="Hex codes for brand consistency (e.g., #FF0000, #00FF00)"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords & Hashtags</Label>
                  <Textarea
                    id="keywords"
                    value={account.keywords_hashtags || ""}
                    onChange={(e) => updateAccount({ keywords_hashtags: e.target.value })}
                    rows={3}
                    placeholder="Seed data for AI to use in content"
                  />
                </div>

                <div>
                  <Label htmlFor="image-style">Image Style</Label>
                  <Select
                    value={account.image_style || ""}
                    onValueChange={(value) => updateAccount({ image_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select image style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate-professional">Corporate Professional</SelectItem>
                      <SelectItem value="modern-minimalist">Modern Minimalist</SelectItem>
                      <SelectItem value="creative-artistic">Creative Artistic</SelectItem>
                      <SelectItem value="warm-friendly">Warm Friendly</SelectItem>
                      <SelectItem value="bold-dynamic">Bold Dynamic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visual-style">Overall Visual Style</Label>
                  <Input
                    id="visual-style"
                    value={account.visual_style || ""}
                    onChange={(e) => updateAccount({ visual_style: e.target.value })}
                    placeholder="Aesthetic filters (e.g., minimalist, warm, moody)"
                  />
                </div>

                <div>
                  <Label htmlFor="brand-personality">Brand Personality</Label>
                  <Input
                    id="brand-personality"
                    value={account.brand_personality || ""}
                    onChange={(e) => updateAccount({ brand_personality: e.target.value })}
                    placeholder="Keywords that guide visual storytelling"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Text Length: {account.text_length || 150} characters</Label>
                  <Slider
                    value={[account.text_length || 150]}
                    onValueChange={(value) => updateAccount({ text_length: value[0] })}
                    max={280}
                    min={50}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emojis"
                    checked={account.include_emojis || false}
                    onCheckedChange={(checked) => updateAccount({ include_emojis: checked })}
                  />
                  <Label htmlFor="emojis">Include Emojis in Posts</Label>
                </div>

                <div>
                  <Label htmlFor="monthly-target">Monthly Post Target</Label>
                  <Input
                    id="monthly-target"
                    type="number"
                    value={account.monthly_post_target || ""}
                    onChange={(e) => updateAccount({ monthly_post_target: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Target cadence for social output"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="products">Products & Services</Label>
                  <Textarea
                    id="products"
                    value={account.products_services || ""}
                    onChange={(e) => updateAccount({ products_services: e.target.value })}
                    rows={3}
                    placeholder="Ordered list of core offerings"
                  />
                </div>

                <div>
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <Textarea
                    id="expertise"
                    value={account.areas_expertise || ""}
                    onChange={(e) => updateAccount({ areas_expertise: e.target.value })}
                    rows={3}
                    placeholder="What makes the client unique"
                  />
                </div>

                <div>
                  <Label htmlFor="topics">Content Topics</Label>
                  <Textarea
                    id="topics"
                    value={account.content_topics || ""}
                    onChange={(e) => updateAccount({ content_topics: e.target.value })}
                    rows={3}
                    placeholder="Prewritten themes to be used in content generation"
                  />
                </div>

                <div>
                  <Label htmlFor="values">Company Values & Mission</Label>
                  <Textarea
                    id="values"
                    value={account.company_values || ""}
                    onChange={(e) => updateAccount({ company_values: e.target.value })}
                    rows={3}
                    placeholder="Used to align post tone and CTA style"
                  />
                </div>

                <div>
                  <Label htmlFor="client-types">Client Types</Label>
                  <Textarea
                    id="client-types"
                    value={account.client_types || ""}
                    onChange={(e) => updateAccount({ client_types: e.target.value })}
                    rows={3}
                    placeholder="Common customer personas"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <LocationManager
              accountId={accountId}
              primaryLocation={account.primary_location}
              serviceLocations={account.service_locations || []}
              onUpdate={handleLocationUpdate}
            />
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <SocialMediaTab accountId={accountId} />
          </TabsContent>

          {/* SEO/Blog Tab */}
          <TabsContent value="seo">
            <SeoTab accountId={accountId} account={account} />
          </TabsContent>

          {/* Display Banners Tab */}
          <TabsContent value="banners">
            <DisplayBannerTab accountId={accountId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
