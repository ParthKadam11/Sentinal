"use client";

import * as React from "react";

type SidebarContextValue = {
  collapsed: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
});

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

type SidebarProviderProps = {
  children: React.ReactNode;
  className?: string;
};

export function SidebarProvider({ children, className }: SidebarProviderProps) {
  return (
    <SidebarContext.Provider value={{ collapsed: false }}>
      <div className={cn("flex min-h-screen w-full flex-col bg-background text-foreground md:flex-row", className)}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  collapsible?: "icon" | "offcanvas" | "none";
  variant?: "sidebar" | "floating" | "inset";
};

export function Sidebar({
  className,
  children,
  collapsible = "none",
  variant = "sidebar",
  ...props
}: SidebarProps) {
  const { collapsed } = React.useContext(SidebarContext);

  return (
    <aside
      data-collapsible={collapsible}
      data-variant={variant}
      className={cn(
        "shrink-0 border-b border-border/70 bg-background transition-[width] duration-200 ease-out md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r",
        collapsed ? "w-16 md:w-16" : "w-full md:w-72",
        className,
      )}
      {...props}
    >
      <div data-slot="sidebar-inner" className="flex h-full flex-col">
        {children}
      </div>
    </aside>
  );
}

export function SidebarInset({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main className={cn("flex min-w-0 flex-1 flex-col", className)} {...props}>
      {children}
    </main>
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center px-4 py-3", className)} {...props} />;
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2", className)} {...props} />;
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col", className)} {...props} />;
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 px-2 py-1", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("list-none", className)} {...props} />;
}

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
  size?: "default" | "sm";
  tooltip?: string;
};

export function SidebarMenuButton({
  asChild,
  isActive,
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const sharedClasses = cn(
    "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors",
    "hover:bg-muted hover:text-foreground",
    "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
    size === "sm" && "px-2 py-1.5 text-xs",
    isActive && "bg-muted font-semibold",
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      title?: string;
    }>;

    return React.cloneElement(child, {
      className: cn(sharedClasses, child.props.className),
      title: tooltip ?? child.props.title,
      ...props,
    });
  }

  return (
    <button type="button" className={sharedClasses} title={tooltip} {...props}>
      {children}
    </button>
  );
}
