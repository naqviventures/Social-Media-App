import { put } from "@vercel/blob"

export async function storeImageFromBase64(base64Data: string, filename: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")

    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: "image/png" })

    // Upload to Vercel Blob
    const { url } = await put(`${filename}.png`, blob, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return url
  } catch (error) {
    console.error("Error storing image:", error)
    throw error
  }
}

export async function storeImageFromUrl(imageUrl: string, filename: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Upload to Vercel Blob
    const { url } = await put(`${filename}.png`, blob, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return url
  } catch (error) {
    console.error("Error storing image from URL:", error)
    throw error
  }
}
