"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

export function OnboardingForm() {
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle>Let's set up your salon</CardTitle>
        <CardDescription>Tell us a bit about your business to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="salon-name">Salon Name</Label>
          <Input id="salon-name" placeholder="e.g., The Glam Room" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo-upload">Salon Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <Input id="logo-upload" type="file" className="flex-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="buffer-time">Default Buffer Time</Label>
                <Select defaultValue="10">
                    <SelectTrigger id="buffer-time">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="INR">
                    <SelectTrigger id="currency">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Complete Setup</Button>
      </CardFooter>
    </Card>
  )
}
