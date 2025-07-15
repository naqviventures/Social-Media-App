"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Eye, Palette, Sparkles, X } from "lucide-react"

interface BannerSize {
  name: string
  width: number
  height: number
  description: string
}

const BANNER_SIZES: BannerSize[] = [
  { name: "Leaderboard", width: 728, height: 90, description: "Top of page banner" },
  { name: "Medium Rectangle", width: 300, height: 250, description: "Sidebar ad" },
  { name: "Large Rectangle", width: 336, height: 280, description: "Content area" },
  { name: "Wide Skyscraper", width: 160, height: 600, description: "Sidebar banner" },
  { name: "Mobile Banner", width: 320, height: 50, description: "Mobile display" },
  { name: "Large Mobile Banner", width: 320, height: 100, description: "Mobile content" },
  { name: "Square", width: 250, height: 250, description: "Social media" },
  { name: "Small Square", width: 200, height: 200, description: "Compact display" },
  { name: "Button", width: 125, height: 125, description: "Small button ad" },
  { name: "Half Page", width: 300, height: 600, description: "Large sidebar" },
]

interface DisplayBannerTabProps {
  accountId: string
}

interface BannerContent {
  headline: string
  bodyText: string
  ctaText: string
}

export default function DisplayBannerTab({ accountId }: DisplayBannerTabProps) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [bannerContent, setBannerContent] = useState<BannerContent>({
    headline: "Your Brand Here",
    bodyText: "Professional Services You Can Trust",
    ctaText: "Learn More",
  })
  const [generatedBanners, setGeneratedBanners] = useState<Array<{ size: BannerSize; html: string; preview: string }>>(
    [],
  )
  const [generating, setGenerating] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState<{ size: BannerSize; html: string; preview: string } | null>(
    null,
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateBanners = async () => {
    if (!backgroundImage) {
      alert("Please upload a background image first")
      return
    }

    setGenerating(true)
    try {
      // Generate banners for the top 10 most popular sizes
      const popularSizes = BANNER_SIZES.slice(0, 10)
      const banners = await Promise.all(
        popularSizes.map(async (size) => {
          const html = generateAnimatedBannerHTML(size, backgroundImage, bannerContent)
          const preview = await generatePreviewDataURL(size, backgroundImage, bannerContent)
          return { size, html, preview }
        }),
      )

      setGeneratedBanners(banners)
    } catch (error) {
      console.error("Failed to generate banners:", error)
    } finally {
      setGenerating(false)
    }
  }

  const generateAnimatedBannerHTML = (size: BannerSize, imageUrl: string, content: BannerContent) => {
    const headlineSize = Math.max(12, Math.min(24, size.width / 15))
    const bodySize = Math.max(10, Math.min(14, size.width / 25))
    const ctaSize = Math.max(10, Math.min(12, size.width / 30))
    const ctaWidth = Math.min(100, size.width * 0.35)
    const ctaHeight = Math.min(30, size.height * 0.2)
    const padding = Math.max(8, Math.min(20, size.width * 0.03))

    // Calculate if this is a small banner (mobile banners, etc.)
    const isSmallBanner = size.height <= 100 || size.width <= 200
    const isVerticalBanner = size.height > size.width * 2

    return `<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        .banner-container {
            width: ${size.width}px;
            height: ${size.height}px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            font-family: 'Inter', Arial, sans-serif;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .banner-container:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        
        .banner-bg {
            width: 100%;
            height: 100%;
            background-image: url('${imageUrl}');
            background-size: cover;
            background-position: center;
            opacity: 0.85;
            transition: opacity 0.4s ease;
        }
        
        .banner-container:hover .banner-bg {
            opacity: 0.95;
        }
        
        .banner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
            display: flex;
            ${isSmallBanner ? "flex-direction: row; align-items: center;" : isVerticalBanner ? "flex-direction: column; justify-content: space-between;" : "flex-direction: column; justify-content: space-between;"}
            padding: ${padding}px;
            color: white;
            gap: ${Math.max(4, padding / 2)}px;
        }
        
        .banner-content {
            ${isSmallBanner ? "flex: 1; margin-right: 8px;" : "flex-grow: 1; display: flex; flex-direction: column; justify-content: center;"}
        }
        
        .banner-headline {
            font-size: ${headlineSize}px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: ${Math.max(2, size.height * 0.02)}px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            animation: slideInLeft 0.8s ease-out;
            opacity: 0;
            animation-fill-mode: forwards;
            ${isSmallBanner ? "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" : ""}
        }
        
        .banner-body {
            font-size: ${bodySize}px;
            font-weight: 400;
            line-height: 1.2;
            margin-bottom: ${isSmallBanner ? "0" : Math.max(4, size.height * 0.03)}px;
            opacity: 0.95;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
            animation: slideInLeft 0.8s ease-out 0.2s;
            opacity: 0;
            animation-fill-mode: forwards;
            ${isSmallBanner ? "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" : ""}
        }
        
        .banner-cta {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            border: none;
            padding: ${Math.max(4, ctaHeight * 0.2)}px ${Math.max(8, ctaWidth * 0.12)}px;
            border-radius: 20px;
            font-size: ${ctaSize}px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 3px 12px rgba(255, 107, 107, 0.4);
            ${isSmallBanner ? "flex-shrink: 0; white-space: nowrap;" : "align-self: flex-start;"}
            animation: slideInUp 0.8s ease-out 0.4s;
            opacity: 0;
            animation-fill-mode: forwards;
            position: relative;
            overflow: hidden;
            min-width: ${ctaWidth}px;
            height: ${ctaHeight}px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .banner-cta:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s;
        }
        
        .banner-cta:hover:before {
            left: 100%;
        }
        
        .banner-cta:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 18px rgba(255, 107, 107, 0.6);
            background: linear-gradient(135deg, #ff5252 0%, #d63031 100%);
        }
        
        .banner-cta:active {
            transform: translateY(0);
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.03);
            }
        }
        
        .banner-container:hover .banner-cta {
            animation: pulse 1.5s infinite;
        }
    </style>
</head>
<body>
    <div class="banner-container" onclick="window.open('#', '_blank')">
        <div class="banner-bg"></div>
        <div class="banner-overlay">
            <div class="banner-content">
                <div class="banner-headline">${content.headline}</div>
                <div class="banner-body">${content.bodyText}</div>
            </div>
            <button class="banner-cta">${content.ctaText}</button>
        </div>
    </div>
</body>
</html>`
  }

  const generatePreviewDataURL = (size: BannerSize, imageUrl: string, content: BannerContent): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = size.width
      canvas.height = size.height
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Load background image first
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          // Draw background image
          ctx.drawImage(img, 0, 0, size.width, size.height)

          // Add overlay gradient
          const overlayGradient = ctx.createLinearGradient(0, 0, size.width, size.height)
          overlayGradient.addColorStop(0, "rgba(0,0,0,0.5)")
          overlayGradient.addColorStop(0.5, "rgba(0,0,0,0.3)")
          overlayGradient.addColorStop(1, "rgba(0,0,0,0.7)")
          ctx.fillStyle = overlayGradient
          ctx.fillRect(0, 0, size.width, size.height)

          // Add text content
          drawTextContent()
        }

        img.onerror = () => {
          // Fallback to gradient background if image fails to load
          const gradient = ctx.createLinearGradient(0, 0, size.width, size.height)
          gradient.addColorStop(0, "#667eea")
          gradient.addColorStop(1, "#764ba2")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, size.width, size.height)

          // Add overlay
          const overlayGradient = ctx.createLinearGradient(0, 0, size.width, size.height)
          overlayGradient.addColorStop(0, "rgba(0,0,0,0.5)")
          overlayGradient.addColorStop(0.5, "rgba(0,0,0,0.3)")
          overlayGradient.addColorStop(1, "rgba(0,0,0,0.7)")
          ctx.fillStyle = overlayGradient
          ctx.fillRect(0, 0, size.width, size.height)

          drawTextContent()
        }

        const drawTextContent = () => {
          const padding = Math.max(8, Math.min(20, size.width * 0.03))
          const isSmallBanner = size.height <= 100 || size.width <= 200
          const isVerticalBanner = size.height > size.width * 2

          // Calculate font sizes
          const headlineSize = Math.max(12, Math.min(24, size.width / 15))
          const bodySize = Math.max(10, Math.min(14, size.width / 25))
          const ctaSize = Math.max(10, Math.min(12, size.width / 30))

          // Calculate CTA button dimensions
          const ctaWidth = Math.min(100, size.width * 0.35)
          const ctaHeight = Math.min(30, size.height * 0.2)

          // Calculate available space for text
          const availableWidth = size.width - padding * 2
          const availableHeight = size.height - padding * 2 - ctaHeight - 8 // Reserve space for CTA + gap

          if (isSmallBanner) {
            // For small banners, arrange horizontally
            const textWidth = availableWidth - ctaWidth - 8 // Reserve space for CTA + gap

            // Draw headline
            ctx.fillStyle = "white"
            ctx.font = `bold ${headlineSize}px Inter, Arial`
            ctx.textAlign = "left"
            ctx.textBaseline = "top"
            ctx.shadowColor = "rgba(0,0,0,0.8)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            const headlineY = padding
            const truncatedHeadline = truncateText(ctx, content.headline, textWidth)
            ctx.fillText(truncatedHeadline, padding, headlineY)

            // Draw body text
            ctx.font = `${bodySize}px Inter, Arial`
            ctx.fillStyle = "rgba(255,255,255,0.95)"
            ctx.shadowBlur = 3
            const bodyY = headlineY + headlineSize + 2
            const truncatedBody = truncateText(ctx, content.bodyText, textWidth)
            ctx.fillText(truncatedBody, padding, bodyY)

            // Draw CTA button (right side)
            const ctaX = size.width - ctaWidth - padding
            const ctaY = padding + (size.height - padding * 2 - ctaHeight) / 2

            drawCTAButton(ctx, ctaX, ctaY, ctaWidth, ctaHeight, content.ctaText, ctaSize)
          } else {
            // For larger banners, arrange vertically
            let currentY = padding

            // Draw headline
            ctx.fillStyle = "white"
            ctx.font = `bold ${headlineSize}px Inter, Arial`
            ctx.textAlign = "left"
            ctx.textBaseline = "top"
            ctx.shadowColor = "rgba(0,0,0,0.8)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            const headlineLines = wrapText(ctx, content.headline, availableWidth, headlineSize * 1.1)
            headlineLines.forEach((line) => {
              ctx.fillText(line, padding, currentY)
              currentY += headlineSize * 1.1
            })

            currentY += Math.max(4, size.height * 0.02)

            // Draw body text
            ctx.font = `${bodySize}px Inter, Arial`
            ctx.fillStyle = "rgba(255,255,255,0.95)"
            ctx.shadowBlur = 3

            const bodyLines = wrapText(ctx, content.bodyText, availableWidth, bodySize * 1.2)
            bodyLines.forEach((line) => {
              ctx.fillText(line, padding, currentY)
              currentY += bodySize * 1.2
            })

            // Draw CTA button (bottom)
            const ctaX = padding
            const ctaY = size.height - ctaHeight - padding

            drawCTAButton(ctx, ctaX, ctaY, ctaWidth, ctaHeight, content.ctaText, ctaSize)
          }

          resolve(canvas.toDataURL())
        }

        const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
          const metrics = ctx.measureText(text)
          if (metrics.width <= maxWidth) return text

          let truncated = text
          while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1)
          }
          return truncated + "..."
        }

        const wrapText = (
          ctx: CanvasRenderingContext2D,
          text: string,
          maxWidth: number,
          lineHeight: number,
        ): string[] => {
          const words = text.split(" ")
          const lines: string[] = []
          let currentLine = ""

          for (const word of words) {
            const testLine = currentLine + (currentLine ? " " : "") + word
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine)
              currentLine = word
            } else {
              currentLine = testLine
            }
          }

          if (currentLine) {
            lines.push(currentLine)
          }

          return lines
        }

        const drawCTAButton = (
          ctx: CanvasRenderingContext2D,
          x: number,
          y: number,
          width: number,
          height: number,
          text: string,
          fontSize: number,
        ) => {
          // Button background gradient
          const ctaGradient = ctx.createLinearGradient(x, y, x + width, y + height)
          ctaGradient.addColorStop(0, "#ff6b6b")
          ctaGradient.addColorStop(1, "#ee5a24")
          ctx.fillStyle = ctaGradient
          ctx.shadowColor = "rgba(255, 107, 107, 0.4)"
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 3

          // Rounded rectangle for button
          ctx.beginPath()
          ctx.roundRect(x, y, width, height, 20)
          ctx.fill()

          // Button text
          ctx.fillStyle = "white"
          ctx.font = `bold ${fontSize}px Inter, Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.shadowColor = "transparent"
          ctx.fillText(text.toUpperCase(), x + width / 2, y + height / 2)
        }

        // Set the image source to trigger loading
        img.src = imageUrl
      } else {
        resolve("")
      }
    })
  }

  const downloadBanner = (banner: { size: BannerSize; html: string; preview: string }, format: "html" | "png") => {
    if (format === "html") {
      const blob = new Blob([banner.html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `banner-${banner.size.name.toLowerCase().replace(/\s+/g, "-")}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const a = document.createElement("a")
      a.href = banner.preview
      a.download = `banner-${banner.size.name.toLowerCase().replace(/\s+/g, "-")}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const downloadAllBanners = () => {
    generatedBanners.forEach((banner, index) => {
      setTimeout(() => {
        downloadBanner(banner, "html")
      }, index * 100)
    })
  }

  const openPreview = (banner: { size: BannerSize; html: string; preview: string }) => {
    setSelectedPreview(banner)
    setPreviewOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Display Banner Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Banner Content Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={bannerContent.headline}
              onChange={(e) => setBannerContent((prev) => ({ ...prev, headline: e.target.value }))}
              placeholder="Your Brand Here"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cta">Call to Action</Label>
            <Input
              id="cta"
              value={bannerContent.ctaText}
              onChange={(e) => setBannerContent((prev) => ({ ...prev, ctaText: e.target.value }))}
              placeholder="Learn More"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="body">Body Text</Label>
            <Textarea
              id="body"
              value={bannerContent.bodyText}
              onChange={(e) => setBannerContent((prev) => ({ ...prev, bodyText: e.target.value }))}
              placeholder="Professional Services You Can Trust"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        {/* Background Image Upload */}
        <div>
          <Label>Background Image</Label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            {backgroundImage && (
              <div className="relative inline-block">
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt="Background preview"
                  className="max-w-xs max-h-32 rounded-lg border object-cover"
                />
                <Badge className="absolute -top-2 -right-2">Uploaded</Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -left-2 h-6 w-6 rounded-full p-0"
                  onClick={() => setBackgroundImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Generate Banners */}
        <div className="flex items-center gap-4">
          <Button
            onClick={generateBanners}
            disabled={generating || !backgroundImage}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Banners"}
          </Button>

          {generatedBanners.length > 0 && (
            <Button variant="outline" onClick={downloadAllBanners} className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Download All HTML
            </Button>
          )}
        </div>

        {/* Generated Banners Grid */}
        {generatedBanners.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Generated Banners ({generatedBanners.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedBanners.map((banner, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{banner.size.name}</h4>
                          <p className="text-sm text-gray-500">
                            {banner.size.width} × {banner.size.height}
                          </p>
                        </div>
                        <Badge variant="secondary">{banner.size.description}</Badge>
                      </div>

                      <div className="relative group cursor-pointer" onClick={() => openPreview(banner)}>
                        <img
                          src={banner.preview || "/placeholder.svg"}
                          alt={`${banner.size.name} banner`}
                          className="w-full border rounded hover:opacity-80 transition-opacity"
                          style={{
                            maxHeight: "120px",
                            objectFit: "contain",
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                          <Button variant="secondary" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBanner(banner, "png")}
                          className="flex-1"
                        >
                          PNG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBanner(banner, "html")}
                          className="flex-1"
                        >
                          HTML5
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {generatedBanners.length === 0 && !generating && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Add your content and upload a background image</p>
            <p className="text-sm">Creates the top 10 most popular banner ad sizes with animations</p>
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPreview?.size.name} Preview ({selectedPreview?.size.width} × {selectedPreview?.size.height})
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              {selectedPreview && (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPreview.html }}
                  className="border rounded-lg overflow-hidden"
                />
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                onClick={() => selectedPreview && downloadBanner(selectedPreview, "png")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button
                onClick={() => selectedPreview && downloadBanner(selectedPreview, "html")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download HTML5
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

// Named export for compatibility
export { DisplayBannerTab }
