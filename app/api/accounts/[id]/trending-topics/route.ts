import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Helper function to determine business context from account data
function determineBusinessContext(account: any): string {
  const industry = account.industry?.toLowerCase() || ""
  const description = account.description?.toLowerCase() || ""
  const name = account.name?.toLowerCase() || ""
  const products = account.products?.toLowerCase() || ""
  const expertise = account.expertise?.toLowerCase() || ""

  // Combine all text for analysis
  const combinedText = `${industry} ${description} ${name} ${products} ${expertise}`

  // Insurance industry detection
  if (
    industry.includes("insurance") ||
    combinedText.includes("insurance") ||
    combinedText.includes("liability") ||
    combinedText.includes("coverage") ||
    combinedText.includes("policy") ||
    combinedText.includes("claims")
  ) {
    if (combinedText.includes("commercial") || combinedText.includes("business")) {
      return "commercial_insurance"
    }
    if (combinedText.includes("residential") || combinedText.includes("home")) {
      return "residential_insurance"
    }
    if (combinedText.includes("life") || combinedText.includes("health")) {
      return "life_health_insurance"
    }
    if (combinedText.includes("auto") || combinedText.includes("vehicle")) {
      return "auto_insurance"
    }
    return "general_insurance"
  }

  // Healthcare detection
  if (
    industry.includes("healthcare") ||
    industry.includes("medical") ||
    combinedText.includes("healthcare") ||
    combinedText.includes("medical") ||
    combinedText.includes("clinic") ||
    combinedText.includes("doctor") ||
    combinedText.includes("patient")
  ) {
    if (combinedText.includes("dental")) return "dental"
    if (combinedText.includes("mental") || combinedText.includes("therapy")) return "mental_health"
    if (combinedText.includes("spine") || combinedText.includes("orthopedic")) return "specialty_medical"
    return "general_healthcare"
  }

  // Legal detection
  if (
    industry.includes("legal") ||
    combinedText.includes("legal") ||
    combinedText.includes("law") ||
    combinedText.includes("attorney") ||
    combinedText.includes("lawyer")
  ) {
    if (combinedText.includes("personal injury")) return "personal_injury_law"
    if (combinedText.includes("business") || combinedText.includes("corporate")) return "business_law"
    if (combinedText.includes("family")) return "family_law"
    return "general_legal"
  }

  // Real Estate detection
  if (
    industry.includes("real estate") ||
    industry.includes("realty") ||
    combinedText.includes("real estate") ||
    combinedText.includes("property") ||
    combinedText.includes("homes") ||
    combinedText.includes("realtor")
  ) {
    if (combinedText.includes("commercial")) return "commercial_real_estate"
    return "residential_real_estate"
  }

  // Technology detection
  if (
    industry.includes("technology") ||
    industry.includes("software") ||
    combinedText.includes("technology") ||
    combinedText.includes("software") ||
    combinedText.includes("digital") ||
    combinedText.includes("tech")
  ) {
    return "technology"
  }

  // Finance detection
  if (
    industry.includes("finance") ||
    industry.includes("financial") ||
    combinedText.includes("finance") ||
    combinedText.includes("financial") ||
    combinedText.includes("banking") ||
    combinedText.includes("investment")
  ) {
    return "financial_services"
  }

  // Restaurant/Food detection
  if (
    industry.includes("restaurant") ||
    industry.includes("food") ||
    combinedText.includes("restaurant") ||
    combinedText.includes("food") ||
    combinedText.includes("dining") ||
    combinedText.includes("cafe")
  ) {
    return "restaurant"
  }

  // Retail detection
  if (
    industry.includes("retail") ||
    combinedText.includes("retail") ||
    combinedText.includes("store") ||
    combinedText.includes("shop") ||
    combinedText.includes("sales")
  ) {
    return "retail"
  }

  // Construction detection
  if (
    industry.includes("construction") ||
    combinedText.includes("construction") ||
    combinedText.includes("contractor") ||
    combinedText.includes("building")
  ) {
    return "construction"
  }

  // Default to general business
  return "general_business"
}

// Industry-specific trending topics
const INDUSTRY_TRENDING_TOPICS = {
  commercial_insurance: [
    "Cyber liability insurance trends for 2024",
    "Commercial property insurance rate changes",
    "Workers compensation claims management",
    "Business interruption coverage updates",
    "Professional liability for remote work",
    "Commercial auto insurance for fleet management",
    "Directors and officers insurance requirements",
    "Employment practices liability claims",
    "General liability coverage gaps",
    "Commercial umbrella policy benefits",
    "Risk management for small businesses",
    "Insurance technology and digital transformation",
  ],
  residential_insurance: [
    "Homeowners insurance rate increases 2024",
    "Natural disaster coverage updates",
    "Home security systems insurance discounts",
    "Flood insurance requirements by state",
    "Personal property coverage limits",
    "Liability protection for home-based businesses",
    "Smart home technology and insurance",
    "Umbrella policy benefits for homeowners",
    "Renters insurance misconceptions",
    "Home renovation insurance considerations",
    "Identity theft protection coverage",
    "Seasonal home maintenance tips",
  ],
  life_health_insurance: [
    "Health insurance marketplace changes 2024",
    "Life insurance needs assessment",
    "Disability insurance for professionals",
    "Long-term care insurance planning",
    "Health savings account benefits",
    "Medicare supplement options",
    "Critical illness insurance coverage",
    "Term vs whole life insurance comparison",
    "Group health insurance trends",
    "Mental health coverage requirements",
    "Prescription drug coverage updates",
    "Wellness programs and premium discounts",
  ],
  auto_insurance: [
    "Auto insurance rates by state 2024",
    "Electric vehicle insurance considerations",
    "Rideshare driver coverage requirements",
    "Teen driver safety and insurance",
    "Comprehensive vs collision coverage",
    "Gap insurance for new car buyers",
    "Usage-based insurance programs",
    "Classic car insurance options",
    "Commercial vehicle insurance",
    "Uninsured motorist protection",
    "Auto insurance claim process tips",
    "Winter driving safety measures",
  ],
  general_insurance: [
    "Insurance industry trends 2024",
    "Risk assessment and management",
    "Claims processing improvements",
    "Insurance fraud prevention",
    "Digital insurance platforms",
    "Customer service in insurance",
    "Regulatory changes affecting coverage",
    "Insurance for emerging risks",
    "Sustainable insurance practices",
    "Insurance education and awareness",
    "Technology in insurance underwriting",
    "Insurance market competition",
  ],
  general_healthcare: [
    "Telehealth adoption and benefits",
    "Preventive care importance",
    "Mental health awareness",
    "Chronic disease management",
    "Healthcare technology innovations",
    "Patient safety initiatives",
    "Healthcare accessibility improvements",
    "Wellness program effectiveness",
    "Healthcare cost management",
    "Medical research breakthroughs",
    "Healthcare policy updates",
    "Patient engagement strategies",
  ],
  specialty_medical: [
    "Minimally invasive spine surgery",
    "Back pain prevention strategies",
    "Spinal health and posture",
    "Recovery after spine surgery",
    "Non-surgical spine treatments",
    "Spine surgery success rates",
    "Physical therapy for spine conditions",
    "Workplace ergonomics for spine health",
    "Sports-related spine injuries",
    "Aging and spine health",
    "Spine surgery technology advances",
    "Pain management techniques",
  ],
  dental: [
    "Preventive dental care importance",
    "Cosmetic dentistry trends",
    "Dental implant success rates",
    "Oral health and overall wellness",
    "Pediatric dental care tips",
    "Dental emergency preparedness",
    "Teeth whitening options",
    "Gum disease prevention",
    "Dental technology advances",
    "Dental insurance coverage",
    "Orthodontic treatment options",
    "Senior dental care needs",
  ],
  mental_health: [
    "Mental health stigma reduction",
    "Therapy accessibility improvements",
    "Workplace mental health support",
    "Teen mental health challenges",
    "Depression and anxiety management",
    "Mental health first aid",
    "Mindfulness and meditation benefits",
    "Mental health in healthcare workers",
    "Substance abuse treatment options",
    "Mental health technology tools",
    "Community mental health resources",
    "Mental health policy advocacy",
  ],
  personal_injury_law: [
    "Personal injury claim process",
    "Car accident injury compensation",
    "Medical malpractice case trends",
    "Workplace injury rights",
    "Slip and fall accident prevention",
    "Product liability lawsuits",
    "Personal injury settlement factors",
    "Insurance company negotiation tactics",
    "Statute of limitations by state",
    "Choosing a personal injury attorney",
    "Documenting injury evidence",
    "Personal injury case timelines",
  ],
  business_law: [
    "Business contract essentials",
    "Intellectual property protection",
    "Employment law compliance",
    "Business formation options",
    "Merger and acquisition trends",
    "Corporate governance best practices",
    "Data privacy regulations",
    "Business dispute resolution",
    "Commercial real estate law",
    "Tax law changes for businesses",
    "International business law",
    "Startup legal considerations",
  ],
  family_law: [
    "Child custody arrangement options",
    "Divorce mediation benefits",
    "Prenuptial agreement importance",
    "Adoption process overview",
    "Domestic violence protection",
    "Child support calculation methods",
    "Property division in divorce",
    "Grandparents' rights",
    "Family law court procedures",
    "Co-parenting strategies",
    "Alimony determination factors",
    "Family law attorney selection",
  ],
  general_legal: [
    "Legal rights awareness",
    "Court system navigation",
    "Legal document preparation",
    "Attorney-client privilege",
    "Legal aid resources",
    "Small claims court process",
    "Legal insurance benefits",
    "Pro bono legal services",
    "Legal technology innovations",
    "Access to justice initiatives",
    "Legal education importance",
    "Alternative dispute resolution",
  ],
  residential_real_estate: [
    "Home buying process steps",
    "Real estate market trends 2024",
    "Mortgage rate predictions",
    "First-time homebuyer programs",
    "Home staging effectiveness",
    "Real estate investment strategies",
    "Property appraisal factors",
    "Homeowner association considerations",
    "Real estate agent selection tips",
    "Home inspection importance",
    "Closing cost breakdown",
    "Real estate negotiation tactics",
  ],
  commercial_real_estate: [
    "Commercial property investment trends",
    "Office space market changes",
    "Retail real estate challenges",
    "Industrial property demand",
    "Commercial lease negotiation",
    "Property management best practices",
    "Commercial real estate financing",
    "Zoning law considerations",
    "Environmental due diligence",
    "Commercial property valuation",
    "Real estate development process",
    "Commercial real estate technology",
  ],
  technology: [
    "Artificial intelligence applications",
    "Cybersecurity best practices",
    "Cloud computing benefits",
    "Software development trends",
    "Digital transformation strategies",
    "Data analytics importance",
    "Mobile app development",
    "Internet of Things innovations",
    "Blockchain technology uses",
    "Tech startup funding",
    "Remote work technology",
    "Technology ethics considerations",
  ],
  financial_services: [
    "Investment strategy updates",
    "Retirement planning essentials",
    "Financial market volatility",
    "Tax planning strategies",
    "Estate planning importance",
    "Financial advisor selection",
    "Cryptocurrency investment risks",
    "Emergency fund guidelines",
    "Debt management strategies",
    "Financial literacy education",
    "Banking technology innovations",
    "Insurance and financial planning",
  ],
  restaurant: [
    "Restaurant industry recovery trends",
    "Food safety protocols",
    "Menu pricing strategies",
    "Customer service excellence",
    "Restaurant technology adoption",
    "Sustainable restaurant practices",
    "Food delivery service impact",
    "Restaurant marketing tactics",
    "Staff training and retention",
    "Restaurant design trends",
    "Local sourcing benefits",
    "Restaurant financial management",
  ],
  retail: [
    "E-commerce growth trends",
    "Customer experience optimization",
    "Inventory management systems",
    "Retail technology innovations",
    "Omnichannel retail strategies",
    "Sustainable retail practices",
    "Retail employee training",
    "Loss prevention strategies",
    "Seasonal retail planning",
    "Customer loyalty programs",
    "Retail analytics importance",
    "Supply chain management",
  ],
  construction: [
    "Construction industry trends 2024",
    "Building material cost fluctuations",
    "Construction safety protocols",
    "Green building practices",
    "Construction technology adoption",
    "Project management best practices",
    "Construction labor shortage",
    "Building code updates",
    "Construction financing options",
    "Quality control in construction",
    "Construction equipment innovations",
    "Sustainable construction methods",
  ],
  general_business: [
    "Small business growth strategies",
    "Digital marketing trends",
    "Customer retention tactics",
    "Business process optimization",
    "Leadership development",
    "Employee engagement strategies",
    "Business networking importance",
    "Financial management for businesses",
    "Innovation in business",
    "Business sustainability practices",
    "Market research methods",
    "Business technology adoption",
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    // Fetch account data to determine business context
    const { data: account, error } = await supabase.from("accounts").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Determine business context
    const businessContext = determineBusinessContext(account)
    console.log(`Business context for ${account.name}: ${businessContext}`)

    // Get industry-specific topics
    const topics = INDUSTRY_TRENDING_TOPICS[businessContext] || INDUSTRY_TRENDING_TOPICS.general_business

    // Shuffle and return a subset of topics
    const shuffledTopics = [...topics].sort(() => Math.random() - 0.5)
    const selectedTopics = shuffledTopics.slice(0, 8)

    return NextResponse.json(selectedTopics)
  } catch (error) {
    console.error("Error fetching trending topics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
