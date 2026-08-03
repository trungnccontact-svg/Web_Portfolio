"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LogIn, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Simple Google SVG Icon
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-4 w-4", className)}
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="google"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
  >
    <path
      fill="currentColor"
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    ></path>
  </svg>
);

export function UserAuthButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const localePrefix = pathname?.split("/")[1] || "en";
  const profileUrl = `/${localePrefix}/profile`;

  if (status === "loading") {
    return (
      <Button variant="outline" size="icon" disabled className="animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        onClick={() => signIn("google")}
        variant="outline"
        size="sm"
        className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-accent transition-all duration-300"
      >
        <GoogleIcon />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    );
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none cursor-pointer group focus:outline-none">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="h-8 w-8 rounded-full border border-border group-hover:border-primary transition-colors object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center bg-muted group-hover:border-primary transition-colors">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1">
        <DropdownMenuLabel className="font-normal cursor-pointer hover:bg-accent/50 rounded-sm transition-colors">
          <Link href={profileUrl} className="flex flex-col space-y-1 w-full">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href={profileUrl} className="flex items-center w-full">
            <Settings className="h-4 w-4" />
            <span>Profile Details</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
