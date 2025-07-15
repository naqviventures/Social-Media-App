import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client for API routes
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface Account {
  id: string
  name: string
  website_url: string
  industry: string
  description: string
  goals: string
  target_audience: string
  tone: string
  color_scheme: string
  monthly_post_count: number
  keywords: string
  text_length: number
  use_emojis: boolean
  website_analysis: string
  products: string
  expertise: string
  blog_topics: string
  company_values: string
  client_types: string
  visual_style: string
  image_style: string
  design_elements: string
  brand_personality: string
  layout_style: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  twitter_url: string
  linkedin_url: string
  tiktok_url?: string
  pinterest_url?: string
  service_locations: any[]
  target_regions: any[]
  location_strategy: string
  primary_location: any
  monthly_blog_count: number
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  account_id: string
  content: string
  hashtags: string[]
  image_url?: string
  image_prompt?: string
  status: "draft" | "scheduled" | "published"
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  account_id: string
  title: string
  content: string
  meta_description?: string
  keywords: string[]
  status: "draft" | "scheduled" | "published"
  created_at: string
  updated_at: string
}
