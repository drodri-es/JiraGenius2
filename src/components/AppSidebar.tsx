'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, BotMessageSquare, Github } from 'lucide-react';
import Link from 'next/link';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { Button } from './ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const { status, disconnect } = useJiraConnection();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/routing', label: 'Routing Tool', icon: BotMessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Github />
            </div>
            <h1 className="text-xl font-headline font-semibold">JiraGenius<span className="text-primary">2</span></h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        {status === 'connected' && (
          <Button variant="ghost" onClick={disconnect} className="w-full justify-start">
            Disconnect
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
