"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, Shield, FileJson, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DATA_URL } from "@/lib/constants";

export function HeroSection() {
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate badge fade-in after mount
    const el = badgeRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
    }
  }, []);

  return (
    <section className="hero-gradient relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative background dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-3xl text-center">
        {/* Badge pill */}
        <div
          ref={badgeRef}
          className="hero-badge-glow mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-opacity duration-700"
          style={{ opacity: 0 }}
        >
          <Shield className="h-3.5 w-3.5" />
          17 Frameworks &middot; 2 Clouds &middot; Real-time Data
        </div>

        {/* Heading */}
        <h1 className="hero-entrance hero-entrance-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Azure Services{" "}
          <span className="hero-title-gradient bg-gradient-to-r from-blue-500 via-foreground to-purple-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Compliance Matrix
          </span>
        </h1>

        {/* Description */}
        <p className="hero-entrance hero-entrance-3 mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
          Explore compliance coverage across Azure and Azure Government services.
          Search, filter, and verify certifications across ISO, SOC, HIPAA,
          PCI DSS, HITRUST, and more &mdash; all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="hero-entrance hero-entrance-4 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              document
                .getElementById("compliance-matrix")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <TableProperties className="h-4 w-4" />
            Explore Matrix
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            render={<a href={DATA_URL} download="azure-compliance.json" />}
          >
            <FileJson className="h-4 w-4" />
            Get JSON
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="hero-entrance hero-entrance-5 mt-16 animate-bounce">
          <button
            onClick={() => {
              document
                .getElementById("compliance-matrix")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            aria-label="Scroll to compliance matrix"
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
