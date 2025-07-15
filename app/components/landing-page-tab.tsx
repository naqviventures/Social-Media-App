"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, ExternalLink, Palette, Layout, Settings, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface LandingPageTabProps {
  accountId: string
  account: any
}

interface LandingPageForm {
  purpose: string
  objective: string
  targetAudience: string
  primaryCTA: string
  ctaInstances: number
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  sections: {
    masthead: boolean
    videoBackground: boolean
    imageCarousel: boolean
    about: boolean
    services: boolean
    reviews: boolean
    testimonials: boolean
    video: boolean
    footer: boolean
  }
  lightDarkMode: boolean
  additionalInstructions: string
}

export function LandingPageTab({ accountId, account }: LandingPageTabProps) {
  const [form, setForm] = useState<LandingPageForm>({
    purpose: account?.business_description || "",
    objective: "Generate leads and increase conversions",
    targetAudience: account?.target_audience || "",
    primaryCTA: "Get Started",
    ctaInstances: 3,
    logoUrl: account?.logo_url || "",
    primaryColor: account?.color_primary || "#3B82F6",
    secondaryColor: account?.color_secondary || "#1E40AF",
    sections: {
      masthead: true,
      videoBackground: false,
      imageCarousel: false,
      about: true,
      services: true,
      reviews: false,
      testimonials: true,
      video: false,
      footer: true,
    },
    lightDarkMode: true,
    additionalInstructions: "",
  })

  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: keyof LandingPageForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSectionChange = (section: keyof typeof form.sections, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: checked,
      },
    }))
  }

  const generatePrompt = () => {
    setIsGenerating(true)

    const selectedSections = Object.entries(form.sections)
      .filter(([_, selected]) => selected)
      .map(([section, _]) => {
        switch (section) {
          case "masthead":
            return form.sections.videoBackground
              ? "Masthead (Hero) with video background"
              : form.sections.imageCarousel
                ? "Masthead (Hero) with image carousel (3 images)"
                : "Masthead (Hero)"
          case "about":
            return "About Section"
          case "services":
            return "Services/Offerings Section"
          case "reviews":
            return "Reviews (Trustpilot or G2 snippets)"
          case "testimonials":
            return "Testimonials (long-form quotes from customers)"
          case "video":
            return "Video section (embedded YouTube or self-hosted)"
          case "footer":
            return "Footer with links, social icons, and contact info"
          default:
            return section
        }
      })

    const prompt = `Create a professional landing page for ${account?.name || "the business"} with the following specifications:

**1. General Info**
- Purpose of the landing page: ${form.purpose}
- Objective/Goal: ${form.objective}
- Target Audience: ${form.targetAudience}
- Primary Call-to-Action (CTA): "${form.primaryCTA}"
- Number of CTA instances: ${form.ctaInstances}
- Logo: ${form.logoUrl || "Use placeholder logo"}
- Color scheme: Primary color: ${form.primaryColor}, Secondary color: ${form.secondaryColor}

**2. Business Context**
- Business Name: ${account?.name || "Business Name"}
- Industry: ${account?.industry || "General"}
- Website: ${account?.website_url || "Not specified"}
- Brand Tone: ${account?.tone || "Professional"}
- Keywords: ${account?.keywords || "Not specified"}

**3. Page Structure**
Include the following sections:
${selectedSections.map((section) => `- ${section}`).join("\n")}

**4. Functional Requirements**
- All CTAs should scroll smoothly to contact form or CTA section
- Responsive on mobile, tablet, and desktop
- ${form.lightDarkMode ? "Include light and dark mode toggle" : "Light mode only"}
- Modern, clean design with professional typography
- Fast loading and optimized for performance
- SEO-friendly structure with proper meta tags

**5. Design Guidelines**
- Use modern UI components (shadcn/ui style)
- Implement smooth animations and transitions
- Ensure accessibility best practices
- Use the specified color scheme consistently
- Professional photography placeholders where needed
- Clean, minimalist layout with good whitespace

**6. Technical Implementation**
- Built with Next.js 14+ App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design with mobile-first approach
- Optimized images and assets
- Contact form with validation

**7. Additional Instructions**
${form.additionalInstructions || "Follow modern web design best practices and ensure the landing page is conversion-optimized."}

Please create a complete, production-ready landing page that follows these specifications and includes all necessary components, styling, and functionality.`

    setGeneratedPrompt(prompt)
    setIsGenerating(false)

    toast({
      title: "Prompt Generated!",
      description: "Your landing page prompt is ready to use.",
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const openInV0 = () => {
    const encodedPrompt = encodeURIComponent(generatedPrompt)
    window.open(`https://v0.dev/chat?q=${encodedPrompt}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Landing Page Builder
          </CardTitle>
          <CardDescription>
            Create a comprehensive prompt for building a professional landing page with v0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-semibold">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Landing Page</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Promote our new SaaS product and generate leads"
                  value={form.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective/Goal</Label>
                <Input
                  id="objective"
                  placeholder="e.g., Generate 100 leads per month"
                  value={form.objective}
                  onChange={(e) => handleInputChange("objective", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Small business owners, age 25-45"
                  value={form.targetAudience}
                  onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryCTA">Primary Call-to-Action</Label>
                <Input
                  id="primaryCTA"
                  placeholder="e.g., Book a Demo, Get Started, Sign Up"
                  value={form.primaryCTA}
                  onChange={(e) => handleInputChange("primaryCTA", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaInstances">Number of CTA Instances</Label>
                <Input
                  id="ctaInstances"
                  type="number"
                  min="1"
                  max="10"
                  value={form.ctaInstances}
                  onChange={(e) => handleInputChange("ctaInstances", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Color Scheme</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Page Structure */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Page Structure</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="masthead"
                    checked={form.sections.masthead}
                    onCheckedChange={(checked) => handleSectionChange("masthead", checked as boolean)}
                  />
                  <Label htmlFor="masthead">Masthead (Hero)</Label>
                </div>

                {form.sections.masthead && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="videoBackground"
                        checked={form.sections.videoBackground}
                        onCheckedChange={(checked) => handleSectionChange("videoBackground", checked as boolean)}
                      />
                      <Label htmlFor="videoBackground" className="text-sm">
                        Use video background
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="imageCarousel"
                        checked={form.sections.imageCarousel}
                        onCheckedChange={(checked) => handleSectionChange("imageCarousel", checked as boolean)}
                      />
                      <Label htmlFor="imageCarousel" className="text-sm">
                        Use image carousel (3 images)
                      </Label>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="about"
                    checked={form.sections.about}
                    onCheckedChange={(checked) => handleSectionChange("about", checked as boolean)}
                  />
                  <Label htmlFor="about">About Section</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="services"
                    checked={form.sections.services}
                    onCheckedChange={(checked) => handleSectionChange("services", checked as boolean)}
                  />
                  <Label htmlFor="services">Services/Offerings Section</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reviews"
                    checked={form.sections.reviews}
                    onCheckedChange={(checked) => handleSectionChange("reviews", checked as boolean)}
                  />
                  <Label htmlFor="reviews">Reviews (Trustpilot/G2 snippets)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="testimonials"
                    checked={form.sections.testimonials}
                    onCheckedChange={(checked) => handleSectionChange("testimonials", checked as boolean)}
                  />
                  <Label htmlFor="testimonials">Testimonials (long-form quotes)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="video"
                    checked={form.sections.video}
                    onCheckedChange={(checked) => handleSectionChange("video", checked as boolean)}
                  />
                  <Label htmlFor="video">Video section (YouTube/self-hosted)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="footer"
                    checked={form.sections.footer}
                    onCheckedChange={(checked) => handleSectionChange("footer", checked as boolean)}
                  />
                  <Label htmlFor="footer">Footer with links & social icons</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Functional Requirements</h3>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lightDarkMode"
                checked={form.lightDarkMode}
                onCheckedChange={(checked) => handleInputChange("lightDarkMode", checked)}
              />
              <Label htmlFor="lightDarkMode">Light and dark mode toggle</Label>
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Instructions</h3>
            <Textarea
              placeholder="Any other unique content, layout needs, or design notes..."
              value={form.additionalInstructions}
              onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
              rows={4}
            />
          </div>

          {/* Generate Button */}
          <Button onClick={generatePrompt} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? "Generating..." : "Generate Landing Page Prompt"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
            <CardDescription>Copy this prompt and use it in v0 to create your landing page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{generatedPrompt}</pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>

              <Button onClick={openInV0}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in v0
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
