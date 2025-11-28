"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect } from "react"

const initialData = [
  { name: "Mon", total: 0 },
  { name: "Tue", total: 0 },
  { name: "Wed", total: 0 },
  { name: "Thu", total: 0 },
  { name: "Fri", total: 0 },
  { name: "Sat", total: 0 },
  { name: "Sun", total: 0 },
]

const chartConfig = {
  total: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};


export function RevenueChart() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    // Generate data on the client to avoid hydration mismatch
    setData([
        { name: "Mon", total: 4500 },
        { name: "Tue", total: 5200 },
        { name: "Wed", total: 6100 },
        { name: "Thu", total: 3800 },
        { name: "Fri", total: 7600 },
        { name: "Sat", total: 9200 },
        { name: "Sun", total: 8100 },
    ])
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weekly Revenue</CardTitle>
        <CardDescription>An overview of your income this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={data}>
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
            <ChartTooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent
                formatter={(value) => `₹${value.toLocaleString()}`}
                indicator="dot"
              />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
