import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/common/main-nav";
import { ModeToggle } from "@/components/common/mode-toggle";
import { LocaleToggle } from "@/components/common/locale-toggle";
import { SiteFooter } from "@/components/common/site-footer";
import ChatBox from "@/components/chat/ChatBox";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { UserAuthButton } from "@/components/common/UserAuthButton";
import { CursorGlow } from "@/components/common/CursorGlow";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          fontHeading.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            themes={["light", "dark", "retro", "cyberpunk", "paper", "aurora", "synthwave"]}
          >
            <NextIntlClientProvider messages={messages}>
              <div className="relative flex min-h-screen flex-col">
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-20 items-center justify-between py-6">
                    <MainNav />
                    <div className="flex flex-1 items-center justify-end space-x-2">
                      <nav className="flex items-center space-x-1">
                        <LocaleToggle />
                        <ModeToggle />
                        <UserAuthButton />
                      </nav>
                    </div>
                  </div>
                </header>
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <ModalProvider />
              <ChatBox />
              <Toaster />
              {/* <CursorGlow /> */}
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
