"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { CirclePlusIcon, MailIcon, ChevronDownIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({
  items,
  currentPath,
}: {
  items: NavItem[];
  currentPath?: string;
}) {
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({
    "Land Declarations": true,
  });

  const toggleOpen = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              render={<Link href="/declarations" />}
            >
              <CirclePlusIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const hasSub = item.items && item.items.length > 0;
            const isOpen = openItems[item.title] ?? false;
            const isMainActive =
              currentPath === item.url ||
              (item.url !== "/dashboard" &&
                item.url !== "/" &&
                currentPath?.startsWith(item.url));

            if (hasSub) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    data-active={isMainActive || undefined}
                    onClick={() => toggleOpen(item.title)}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDownIcon
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </SidebarMenuButton>

                  {isOpen && (
                    <SidebarMenuSub className="mt-1">
                      {item.items?.map((sub) => {
                        const isSubActive = currentPath === sub.url;
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              isActive={isSubActive}
                              render={<Link href={sub.url} />}
                            >
                              <span>{sub.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  data-active={isMainActive || undefined}
                  render={<Link href={item.url} />}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
