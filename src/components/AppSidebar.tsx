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
import { Briefcase, Settings, BotMessageSquare, Github, LayoutDashboard, Layers, Tag, BarChart, Tags, BrainCircuit, Repeat, FilePenLine } from 'lucide-react';
import Link from 'next/link';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { Button } from './ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const { disconnect } = useJiraConnection();

  const mainMenuItems = [
    { href: '/dashboard', label: 'Projects', icon: Briefcase },
    { href: '/issues', label: 'Issues', icon: LayoutDashboard },
  ];

  const aiToolsMenuItems = [
    { href: '/routing', label: 'Routing', icon: BotMessageSquare },
    { href: '/clustering', label: 'Clustering', icon: Layers },
    { href: '/classification', label: 'Classification', icon: Tag },
    { href: '/tagging', label: 'Tagging', icon: Tags },
    { href: '/capacity-forecast', label: 'Capacity Forecast', icon: BarChart },
    { href: '/incident-recurrence', label: 'Incident Recurrence', icon: Repeat },
    { href: '/story-assistance', label: 'Story Assistance', icon: FilePenLine },
  ];

  const settingsMenuItem = { href: '/settings', label: 'Settings', icon: Settings };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-accent-foreground">
                <Github />
            </div>
            <h1 className="text-xl font-headline font-semibold">JiraGenius<span className="text-accent-foreground">2</span></h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {mainMenuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href) && (item.href !== '/' && item.href !== '/issues' || pathname === item.href)}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        <SidebarMenuItem>
          <div className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm h-8">
            <BrainCircuit className="h-4 w-4" />
            <span>AI Tools</span>
          </div>
        </SidebarMenuItem>
        
        <div className="flex flex-col pl-4">
            {aiToolsMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="h-8"
                    >
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </div>

        <SidebarMenuItem className="mt-auto">
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(settingsMenuItem.href)}
                tooltip={settingsMenuItem.label}
            >
                <Link href={settingsMenuItem.href}>
                <settingsMenuItem.icon />
                <span>{settingsMenuItem.label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>
      <SidebarFooter>
        <Button variant="ghost" onClick={disconnect} className="w-full justify-start">
          Disconnect
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
