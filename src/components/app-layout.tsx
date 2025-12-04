"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Scissors, Users, User, Settings, Gem, LogOut, Package, ExternalLink } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarInset 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle'; 
import { useSalon } from "@/hooks/useSalon";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from 'react';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/calendar', icon: Calendar, label: 'Calendar', tooltip: 'Calendar' },
    { href: '/services', icon: Scissors, label: 'Services', tooltip: 'Services' },
    { href: '/staff', icon: Users, label: 'Staff', tooltip: 'Staff' },
    { href: '/customers', icon: User, label: 'Customers', tooltip: 'Customers' },
    { href: '/settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, salon, loading } = useSalon();
    
    // Fix Hydration Mismatch: Ensure we don't render until client is mounted
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- LOGIC: HIDE SIDEBAR ON PUBLIC PAGES ---
    const isPublicPage = 
        pathname === "/" || 
        pathname === "/login" || 
        pathname === "/onboarding" ||
        pathname?.startsWith("/book"); // Safe check with optional chaining

    // Prevent hydration mismatch by returning a simple container during server render if path is ambiguous,
    // OR just render children if we know it's public.
    if (isPublicPage) {
        return (
            <main className="min-h-screen w-full bg-background text-foreground animate-in fade-in duration-300">
                {children}
            </main>
        );
    }

    // --- LOGOUT LOGIC ---
    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name ? name.substring(0, 2).toUpperCase() : "GF";
    };

    // Optional: Show loading state if auth is initializing (prevents flashes)
    if (!isMounted) return null;

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Link href="/dashboard" className="flex items-center gap-2 p-2 group" aria-label="GlamOps Home">
                       <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                         <Gem className="size-4" />
                       </div>
                        <h1 className="text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
                            GlamOps
                        </h1>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={pathname === item.href}
                                    tooltip={item.tooltip}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="p-2">
                     <SidebarMenu>
                        <SidebarMenuItem>
                           <SidebarMenuButton asChild tooltip="Public Booking">
                               {/* Use Next/Link for better client-side navigation handling */}
                               <Link 
                                 href={salon?.slug ? `/book/${salon.slug}` : '#'} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                               >
                                 <ExternalLink />
                                 <span>Public Booking</span>
                               </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                             {(!salon || salon.type === 'demo') && (
                                <SidebarMenuButton asChild tooltip="Setup Real Salon">
                                    <Link href="/onboarding" className="text-primary font-medium">
                                        <Package />
                                        <span>Set up Real Salon</span>
                                    </Link>
                                </SidebarMenuButton>
                             )}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        
                        {/* --- USER PROFILE DROPDOWN --- */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage 
                                            src={user?.photoURL || ""} 
                                            alt={user?.displayName || "User"} 
                                        />
                                        <AvatarFallback>
                                            {salon?.name ? getInitials(salon.name) : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {loading ? "Loading..." : (salon?.name || "My Salon")}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email || "Guest"}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}