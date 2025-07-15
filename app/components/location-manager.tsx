"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, X, Building, Globe } from "lucide-react"

interface Location {
  id: string
  city: string
  state: string
  radius?: number
  is_statewide?: boolean
}

interface LocationManagerProps {
  accountId: string
  primaryLocation?: Location | null
  serviceLocations?: Location[]
  onUpdate?: (primaryLocation: Location | null, serviceLocations: Location[]) => void
}

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export default function LocationManager({
  accountId,
  primaryLocation = null,
  serviceLocations = [],
  onUpdate,
}: LocationManagerProps) {
  const [primary, setPrimary] = useState<Location | null>(primaryLocation)
  const [services, setServices] = useState<Location[]>(serviceLocations)
  const [newLocation, setNewLocation] = useState({ city: "", state: "", radius: 25, is_statewide: false })

  useEffect(() => {
    setPrimary(primaryLocation || null)
    setServices(serviceLocations || [])
  }, [primaryLocation, serviceLocations])

  const handlePrimaryUpdate = (field: string, value: any) => {
    const updated = { ...primary, [field]: value } as Location
    setPrimary(updated)
    if (onUpdate) {
      onUpdate(updated, services)
    }
  }

  const addServiceLocation = () => {
    if (!newLocation.city && !newLocation.is_statewide) return
    if (!newLocation.state) return

    const location: Location = {
      id: Date.now().toString(),
      city: newLocation.is_statewide ? "" : newLocation.city,
      state: newLocation.state,
      radius: newLocation.is_statewide ? undefined : newLocation.radius,
      is_statewide: newLocation.is_statewide,
    }

    const updated = [...services, location]
    setServices(updated)
    if (onUpdate) {
      onUpdate(primary, updated)
    }
    setNewLocation({ city: "", state: "", radius: 25, is_statewide: false })
  }

  const removeServiceLocation = (id: string) => {
    const updated = services.filter((loc) => loc.id !== id)
    setServices(updated)
    if (onUpdate) {
      onUpdate(primary, updated)
    }
  }

  const updateServiceLocation = (id: string, field: string, value: any) => {
    const updated = services.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc))
    setServices(updated)
    if (onUpdate) {
      onUpdate(primary, updated)
    }
  }

  return (
    <div className="space-y-6">
      {/* Primary Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Primary Business Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-city">City</Label>
              <Input
                id="primary-city"
                value={primary?.city || ""}
                onChange={(e) => handlePrimaryUpdate("city", e.target.value)}
                placeholder="Enter city name"
              />
            </div>
            <div>
              <Label htmlFor="primary-state">State</Label>
              <Select value={primary?.state || ""} onValueChange={(value) => handlePrimaryUpdate("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {primary && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="primary-statewide"
                  checked={primary.is_statewide || false}
                  onCheckedChange={(checked) => handlePrimaryUpdate("is_statewide", checked)}
                />
                <Label htmlFor="primary-statewide">Serve entire state</Label>
              </div>

              {!primary.is_statewide && (
                <div>
                  <Label>Service Radius: {primary.radius || 25} miles</Label>
                  <Slider
                    value={[primary.radius || 25]}
                    onValueChange={(value) => handlePrimaryUpdate("radius", value[0])}
                    max={200}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Additional Service Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Location */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add Service Location</h4>

            <div className="flex items-center space-x-2">
              <Switch
                id="new-statewide"
                checked={newLocation.is_statewide}
                onCheckedChange={(checked) =>
                  setNewLocation({ ...newLocation, is_statewide: checked, city: checked ? "" : newLocation.city })
                }
              />
              <Label htmlFor="new-statewide">Entire state</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!newLocation.is_statewide && (
                <div>
                  <Label>City</Label>
                  <Input
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    placeholder="Enter city name"
                  />
                </div>
              )}

              <div>
                <Label>State</Label>
                <Select
                  value={newLocation.state}
                  onValueChange={(value) => setNewLocation({ ...newLocation, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!newLocation.is_statewide && (
                <div>
                  <Label>Radius: {newLocation.radius} miles</Label>
                  <Slider
                    value={[newLocation.radius]}
                    onValueChange={(value) => setNewLocation({ ...newLocation, radius: value[0] })}
                    max={200}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <Button onClick={addServiceLocation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {/* Existing Service Locations */}
          <div className="space-y-3">
            {services.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {location.is_statewide ? (
                    <Globe className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {location.is_statewide ? (
                        <span>Entire {location.state}</span>
                      ) : (
                        <span>
                          {location.city}, {location.state}
                        </span>
                      )}
                    </div>
                    {!location.is_statewide && (
                      <div className="text-sm text-gray-500">{location.radius} mile radius</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!location.is_statewide && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Radius:</Label>
                      <Slider
                        value={[location.radius || 25]}
                        onValueChange={(value) => updateServiceLocation(location.id, "radius", value[0])}
                        max={200}
                        min={5}
                        step={5}
                        className="w-20"
                      />
                      <span className="text-xs w-8">{location.radius}mi</span>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" onClick={() => removeServiceLocation(location.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <p className="text-gray-500 text-center py-4">No additional service locations added</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
