"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect } from "react"

const initialData = [
  { name: "Mon", total: 0 },
  { name: "Tue", total: 0 },
  { name: "Wed", total: 0 },
  { name: "Thu", total: 0 },
  { name
: "Fri", total: 0 },
  { name: "Sat", total: 0 },
  { name: "Sun", total: 0 },
]

export function RevenueChart() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    setData([
      { name: "Mon", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Tue", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Wed", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Thu", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Fri", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Sat", total: Math.floor(Math.random() * 5000) + 1000 },
      { name: "Sun", total: Math.floor(Math.random() * 5000) + 1000 },
    ])
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weekly Revenue</CardTitle>
        <CardDescription>An overview of your income this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent
                formatter={(value) => `₹${value.toLocaleString()}`}
                indicator="dot"
              />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
