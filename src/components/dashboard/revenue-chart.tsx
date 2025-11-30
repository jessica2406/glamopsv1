"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useSalonData } from "@/hooks/use-salon-data"
import { format, subDays, isSameDay } from "date-fns"
import { Loader2 } from "lucide-react"

const chartConfig = {
  total: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

export function RevenueChart() {
  const { appointments, loading } = useSalonData();

  // Process Data: Generate last 7 days revenue
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i); // Go back 6 days up to today
    const dayName = format(date, "EEE"); // "Mon", "Tue"
    
    // Sum price of all confirmed appointments on this specific day
    const dayTotal = appointments
        .filter(a => isSameDay(a.date, date) && a.status !== 'cancelled')
        .reduce((sum, a) => sum + a.price, 0);

    return { name: dayName, total: dayTotal };
  });

  if (loading) {
     return (
        <Card className="shadow-sm h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
     )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weekly Revenue</CardTitle>
        <CardDescription>Your actual income over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={chartData}>
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
              tickFormatter={(value) => `₹${value}`}
            />
            <ChartTooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent
                formatter={(value) => `₹${Number(value).toLocaleString()}`}
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