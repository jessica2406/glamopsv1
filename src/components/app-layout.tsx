"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Scissors, Users, User, Settings, Gem, LogOut, Package, ExternalLink, Moon, Sun } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';

const navItems = [
    { href: '/demo', icon: Home, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/calendar', icon: Calendar, label: 'Calendar', tooltip: 'Calendar' },
    { href: '/services', icon: Scissors, label: 'Services', tooltip: 'Services' },
    { href: '/staff', icon: Users, label: 'Staff', tooltip: 'Staff' },
    { href: '/customers', icon: User, label: 'Customers', tooltip: 'Customers' },
    { href: '/settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Link href="/" className="flex items-center gap-2 p-2 group" aria-label="GlamFlow Home">
                       <div className="p-2 bg-primary rounded-lg">
                         <Gem className="w-6 h-6 text-primary-foreground" />
                       </div>
                        <h1 className="text-xl font-bold text-foreground group-data-[state=collapsed]:hidden">GlamFlow</h1>
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
                               <a href="/book" target="_blank">
                                 <ExternalLink />
                                 <span>Public Booking</span>
                               </a>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                           <SidebarMenuButton asChild tooltip="Onboarding">
                               <Link href="/onboarding">
                                 <Package />
                                 <span>Onboarding</span>
                               </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 sticky top-0 z-30">
                    <SidebarTrigger className="sm:hidden" />
                    <div className="flex-1">
                        {/* Can add a global search here later */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="https://picsum.photos/seed/owner/100/100" alt="Alex Johnson" />
                                        <AvatarFallback>AJ</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Alex Johnson</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            alex@glamflow.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
