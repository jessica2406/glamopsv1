"use client";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Copy } from "lucide-react";
import Image from "next/image";

export function SettingsContent() {
    const { toast } = useToast();
    const embedCode = `<iframe src="${window.location.origin}/book" style="width:100%;height:700px;border:none;" title="GlamFlow Booking"></iframe>`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        toast({
            title: "Copied to clipboard!",
            description: "You can now paste the embed code into your website.",
        });
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Salon Profile</CardTitle>
                    <CardDescription>Update your salon's public information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="salonName">Salon Name</Label>
                        <Input id="salonName" defaultValue="The Glam Room" />
                    </div>
                    <div className="space-y-2">
                        <Label>Salon Logo</Label>
                        <div className="flex items-center gap-4">
                           <Image src="https://picsum.photos/seed/logo/200/200" alt="Salon Logo" width={64} height={64} className="rounded-lg" data-ai-hint="abstract purple"/>
                           <Button variant="outline">Change Logo</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bufferTime">Default Buffer Time</Label>
                            <Select defaultValue="10">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0 minutes</SelectItem>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select defaultValue="INR">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">₹ (INR)</SelectItem>
                                    <SelectItem value="USD">$ (USD)</SelectItem>
                                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Embed on Your Website</CardTitle>
                    <CardDescription>Copy and paste this code to add the booking flow to your website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="embedCode">Embed Code</Label>
                        <Textarea id="embedCode" readOnly value={embedCode} className="h-32 font-mono text-xs" />
                    </div>
                    <Button onClick={copyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
