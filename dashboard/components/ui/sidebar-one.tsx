"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutGridIcon,
  BarChart3Icon,
  BriefcaseIcon,
  UsersIcon,
  PlugIcon,
  KeyRoundIcon,
  SettingsIcon,
  SendIcon,
  HelpCircleIcon,
  BookOpenIcon,
  MoonStarIcon,
  SunMediumIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/blocks/sidebar";
import { NavUser } from "@/components/ui/nav-user";

type SidebarNavItem = {
  title: string;
  url: string;
  icon: ReactNode;
  isActive?: boolean;
};

type SidebarNavGroup = {
  label?: string;
  items: SidebarNavItem[];
};

const navGroups: SidebarNavGroup[] = [
  {
    label: "Product",
    items: [
      { title: "Dashboard", url: "#/overview", icon: <LayoutGridIcon />, isActive: true },
      { title: "Analytics", url: "#/analytics", icon: <BarChart3Icon /> },
      { title: "Projects", url: "#/projects", icon: <BriefcaseIcon /> },
      { title: "Team", url: "#/team", icon: <UsersIcon /> },
      { title: "Integrations", url: "#/integrations", icon: <PlugIcon /> },
      { title: "API Keys", url: "#/api-keys", icon: <KeyRoundIcon /> },
    ],
  },
  {
    label: "Administration",
    items: [{ title: "Settings", url: "#/settings", icon: <SettingsIcon /> }],
  },
];

const footerNavLinks: SidebarNavItem[] = [
  { title: "Feedback", url: "#/feedback", icon: <SendIcon /> },
  { title: "Help Center", url: "#/help", icon: <HelpCircleIcon /> },
  { title: "Documentation", url: "#/documentation", icon: <BookOpenIcon /> },
];

function getActiveHash() {
  return window.location.hash || "#/overview";
}

function getThemeElement() {
  return document.documentElement;
}

export function AppSidebar() {
  const [activeHash, setActiveHash] = useState("#/overview");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const initialDarkMode = savedTheme === "dark";

    setIsDarkMode(initialDarkMode);
    getThemeElement().dataset.theme = initialDarkMode ? "dark" : "light";
    setActiveHash(getActiveHash());

    const handleHashChange = () => setActiveHash(getActiveHash());

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    getThemeElement().dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const activeItemUrl = useMemo(() => activeHash, [activeHash]);

  return (
    <Sidebar
      className="min-h-full *:data-[slot=sidebar-inner]:bg-background"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="relative h-14 justify-center px-2 py-0">
        <a className="flex h-10 items-center rounded-lg px-3 text-sm font-semibold tracking-[0.22em] text-foreground uppercase" href="#link">
          Sentinal
        </a>
        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            type="button"
            onClick={() => setIsDarkMode((current) => !current)}
          >
            {isDarkMode ? <SunMediumIcon className="h-4 w-4" /> : <MoonStarIcon className="h-4 w-4" />}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <SidebarGroup key={`sidebar-group-${index}`}>
            {group.label && <SidebarGroupLabel className="font-normal">{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeItemUrl === item.url}
                    tooltip={item.title}
                  >
                    <a href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-0 p-0">
        <SidebarMenu className="border-t border-border/70 p-2">
          {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground"
                isActive={activeItemUrl === item.url}
                size="sm"
              >
                <a href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
