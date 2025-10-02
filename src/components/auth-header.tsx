"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthHeaderProps {
  showGetStarted?: boolean;
}

export function AuthHeader({ showGetStarted = false }: AuthHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      <SignedOut>
        {showGetStarted ? (
          <SignInButton>
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </SignInButton>
        ) : (
          <SignInButton>
            <Button size="sm" className="text-xs sm:text-sm">
              Sign In
            </Button>
          </SignInButton>
        )}
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}