"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, RefreshCw, Plus } from "lucide-react"

interface TrendingTopicsProps {
  accountId: string
  onTopicSelect?: (topic: string) => void
}

export function TrendingTopics({ accountId, onTopicSelect }: TrendingTopicsProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTopics = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}/trending-topics`)
      if (response.ok) {
        const data = await response.json()
        // Handle both direct array and wrapped object responses
        const topicsArray = Array.isArray(data) ? data : data.topics || []
        setTopics(topicsArray)
      } else {
        console.error("Failed to fetch trending topics")
        setTopics([])
      }
    } catch (error) {
      console.error("Error fetching trending topics:", error)
      setTopics([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [accountId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTopics()
  }

  const handleTopicClick = (topic: string) => {
    if (onTopicSelect) {
      onTopicSelect(topic)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-sm text-gray-600">Industry-specific trending topics for content inspiration</p>
      </CardHeader>
      <CardContent>
        {topics && topics.length > 0 ? (
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{topic}</span>
                </div>
                {onTopicSelect && (
                  <Button variant="ghost" size="sm" onClick={() => handleTopicClick(topic)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trending topics available</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
