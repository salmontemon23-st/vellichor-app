import type { Metadata } from "next";
import "../globals.css";
import { fraunces, inter, plexMono } from "@/lib/fonts";
import { DocsHeader } from "@/components/DocsHeader";
import { DocsSidebar } from "@/components/DocsSidebar";
import { DocsToc } from "@/components/DocsToc";
import { DocsPrevNext } from "@/components/DocsPrevNext";

export const metadata: Metadata = {
  title: "Vellichor Docs",
  description: "Reference documentation for the Vellichor protocol.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} docs-dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <DocsHeader />
        <main className="flex-1">
          <div className="container py-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_200px]">
              <DocsSidebar />
              <div id="docs-content" className="min-w-0 max-w-3xl pb-16">
                {children}
                <DocsPrevNext />
              </div>
              <DocsToc />
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
