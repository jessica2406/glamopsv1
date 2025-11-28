"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, Activity } from "lucide-react"

export function SummaryCards() {
  const summaryData = [
    {
      title: "Today's Revenue",
      value: "₹8,450",
      icon: DollarSign,
      change: "+15.2% from last week",
      color: "text-green-500",
    },
    {
      title: "Appointments Today",
      value: "12",
      icon: Calendar,
      change: "+2 since yesterday",
      color: "text-blue-500",
    },
    {
      title: "New Customers",
      value: "4",
      icon: Users,
      change: "This week",
      color: "text-purple-500",
    },
    {
      title: "Salon Occupancy",
      value: "78%",
      icon: Activity,
      change: "Peak hours: 1-3 PM",
      color: "text-amber-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item) => (
        <Card key={item.title} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
