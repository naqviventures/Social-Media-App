"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Loader2, Globe } from "lucide-react"

export default function NewAccount() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    industry: "",
    description: "",
    goals: "",
    target_audience: "",
    tone: "",
    color_scheme: "",
    monthly_post_count: 2, // Default to 2 posts per month
    keywords: "",
    text_length: 150,
    use_emojis: true,
    image_style: "corporate_professional",
    visual_style: "",
    brand_personality: "",
    design_elements: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    linkedin_url: "",
    products: "",
    expertise: "",
    blog_topics: "",
    company_values: "",
    client_types: "",
    service_locations: [],
    target_regions: [],
    location_strategy: "local",
    primary_location: { city: "", state: "", country: "United States" },
    monthly_blog_count: 2,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeWebsite = async () => {
    if (!formData.website_url) {
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
        body: JSON.stringify({ url: formData.website_url }),
      })

      if (response.ok) {
        const analysis = await response.json()

        // Auto-fill ALL form fields based on analysis
        setFormData((prev) => ({
          ...prev,
          description: analysis.description || prev.description,
          industry: analysis.industry || prev.industry,
          tone: analysis.tone || prev.tone,
          color_scheme: analysis.colorScheme || prev.color_scheme,
          keywords: analysis.keywords || prev.keywords,
          target_audience: analysis.targetAudience || prev.target_audience,
          goals: analysis.goals || prev.goals,
          products: analysis.products || prev.products,
          expertise: analysis.expertise || prev.expertise,
          blog_topics: analysis.blogTopics || prev.blog_topics,
          company_values: analysis.companyValues || prev.company_values,
          client_types: analysis.clientTypes || prev.client_types,
          brand_personality: analysis.brandPersonality || prev.brand_personality,
          image_style: analysis.imageStyle || prev.image_style,
          visual_style: analysis.visualStyle || prev.visual_style,
          design_elements: analysis.designElements || prev.design_elements,
          facebook_url: analysis.facebookUrl || prev.facebook_url,
          instagram_url: analysis.instagramUrl || prev.instagram_url,
          youtube_url: analysis.youtubeUrl || prev.youtube_url,
          twitter_url: analysis.twitterUrl || prev.twitter_url,
          linkedin_url: analysis.linkedinUrl || prev.linkedin_url,
        }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.website_url || !formData.industry) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const account = await response.json()
        router.push(`/accounts/${account.id}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to create account: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating account:", error)
      alert("Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Account</h1>
            <p className="text-gray-600">Set up a new client account for social media content management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core account details and business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Acme Spine Specialists"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="website"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => updateFormData("website_url", e.target.value)}
                      placeholder="https://acmespinespecialists.com/"
                      required
                    />
                    <Button
                      type="button"
                      onClick={analyzeWebsite}
                      disabled={analyzing || !formData.website_url}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Click the globe icon to analyze and auto-fill form fields</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Acme Spine Specialists is a healthcare provider focused on spine surgery and treatment of spinal conditions. They offer comprehensive care with a focus on relieving pain and restoring quality of life through both surgical and non-surgical methods."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals & Objectives</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => updateFormData("goals", e.target.value)}
                  placeholder="Increase brand awareness, generate leads, educate patients about spinal health"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Textarea
                  id="target-audience"
                  value={formData.target_audience}
                  onChange={(e) => updateFormData("target_audience", e.target.value)}
                  placeholder="Patients experiencing back pain, aged conditions, individuals seeking specialized spine surgery, healthcare professionals looking for expert spinal care"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tone">Brand Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => updateFormData("tone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="compassionate">Compassionate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Input
                    id="color-scheme"
                    value={formData.color_scheme}
                    onChange={(e) => updateFormData("color_scheme", e.target.value)}
                    placeholder="Blue, #FFF, Blue, #2237FF, #0000FF, #6666FF"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords & Hashtags</Label>
                <Textarea
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => updateFormData("keywords", e.target.value)}
                  placeholder="spine surgery, back pain, spinal surgery, cervical herniated disc, lumbar herniated disc, spinal stenosis, scoliosis"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_post_count">Monthly Post Target: {formData.monthly_post_count} posts</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.monthly_post_count]}
                    onValueChange={(value) => updateFormData("monthly_post_count", value[0])}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 post</span>
                    <span>{formData.monthly_post_count} posts</span>
                    <span>30 posts</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Set the target number of social media posts to generate per month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Content Generation Settings</CardTitle>
              <CardDescription>Control how AI generates content for this account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Text Length: {formData.text_length} characters</Label>
                  <Slider
                    value={[formData.text_length]}
                    onValueChange={(value) => updateFormData("text_length", value[0])}
                    max={300}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50 chars</span>
                    <span>{formData.text_length} chars</span>
                    <span>300 chars</span>
                  </div>
                  <p className="text-xs text-gray-500">Controls the approximate length of generated post content</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-emojis"
                    checked={formData.use_emojis}
                    onCheckedChange={(checked) => updateFormData("use_emojis", checked)}
                  />
                  <Label htmlFor="include-emojis">Include emojis in posts</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
