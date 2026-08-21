"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Send, Github, Linkedin, Copy, Check } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const EMAIL = "trungnc.contact@gmail.com";

export default function Contact() {
  const t = useTranslations("contact");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    toast({
      title: t("copied"),
      description: EMAIL,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-20">
      <div className="container max-w-5xl mx-auto px-4">
        <AnimatedSection className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground max-w-md mx-auto pt-2">
              {t("description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 w-full">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="font-heading text-2xl font-bold">{t("title")}</h3>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{t("description")}"
                </p>
              </div>

              <div className="grid gap-4">
                <Card className="border-border bg-card/50 overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                        <p className="text-sm font-semibold">{EMAIL}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={copyEmail}
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" size="icon" asChild className="rounded-full h-12 w-12 border-2 transition-transform hover:scale-110 active:scale-95">
                  <a href="https://github.com/trungit" target="_blank" rel="noopener noreferrer">
                    <Github size={20} />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild className="rounded-full h-12 w-12 border-2 transition-transform hover:scale-110 active:scale-95">
                  <a href="https://www.linkedin.com/in/trungit2026/" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={20} />
                  </a>
                </Button>
              </div>
            </div>

            {/* Form */}
            <Card className="border-2 border-border shadow-xl">
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your Name" className="bg-muted/50" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="email@example.com" className="bg-muted/50" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="How can I help you?" className="min-h-[120px] bg-muted/50" />
                  </div>
                  <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]">
                    <Send className="mr-2 h-5 w-5" />
                    {t("emailMe")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
