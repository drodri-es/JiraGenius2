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
import { Briefcase, Settings, BotMessageSquare, Github, LayoutDashboard, Layers, Tag, BarChart, Tags } from 'lucide-react';
import Link from 'next/link';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { Button } from './ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const { disconnect } = useJiraConnection();

  const menuItems = [
    { href: '/dashboard', label: 'Projects', icon: Briefcase },
    { href: '/issues', label: 'Issues', icon: LayoutDashboard },
    { href: '/routing', label: 'Routing Tool', icon: BotMessageSquare },
    { href: '/clustering', label: 'Clustering', icon: Layers },
    { href: '/classification', label: 'Classification', icon: Tag },
    { href: '/tagging', label: 'Tagging', icon: Tags },
    { href: '/capacity-forecast', label: 'Capacity Forecast', icon: BarChart },
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
              isActive={pathname.startsWith(item.href)}
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
        <Button variant="ghost" onClick={disconnect} className="w-full justify-start">
          Disconnect
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
