"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, Activity, Loader2 } from "lucide-react"
import { useSalonData } from "@/hooks/use-salon-data" // Import the hook

export function SummaryCards() {
  const { stats, loading } = useSalonData(); // Use real data

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         {[1,2,3,4].map(i => (
           <Card key={i} className="h-32 flex items-center justify-center">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </Card>
         ))}
      </div>
    )
  }

  const summaryData = [
    {
      title: "Today's Revenue",
      value: `₹${stats.revenue.toLocaleString()}`, // Real Value
      icon: DollarSign,
      change: "Daily Real-time",
      color: "text-green-500",
    },
    {
      title: "Appointments Today",
      value: stats.appointmentsToday.toString(), // Real Value
      icon: Calendar,
      change: "Scheduled for today",
      color: "text-blue-500",
    },
    {
      title: "Total Customers",
      value: stats.customersTotal.toString(), // Real Value
      icon: Users,
      change: "All time unique",
      color: "text-purple-500",
    },
    {
      title: "Salon Occupancy",
      value: `${stats.occupancy}%`, // Calculated Value
      icon: Activity,
      change: "Based on capacity",
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