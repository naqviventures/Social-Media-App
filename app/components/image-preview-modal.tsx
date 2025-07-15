"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface ImagePreviewModalProps {
  imageUrl: string
  imagePrompt?: string
  onClose: () => void
}

export function ImagePreviewModal({ imageUrl, imagePrompt, onClose }: ImagePreviewModalProps) {
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    if (imagePrompt) {
      try {
        await navigator.clipboard.writeText(imagePrompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error("Failed to copy prompt:", error)
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Generated content"
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=400&text=Image+Error"
              }}
            />
          </div>

          {imagePrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Image Generation Prompt</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{imagePrompt}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
