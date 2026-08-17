"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  children: string
  className?: string
}

/**
 * Lightweight markdown renderer for comment bodies.
 * Supports: headings, bold/italic, inline code, code blocks, lists,
 * links, blockquotes, and line breaks.
 *
 * Note: react-markdown v10 requires `remark-gfm` for tables/strikethrough
 * which we don't have installed, so those features are intentionally omitted.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed break-words",
        // Headings
        "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1",
        "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1",
        "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-1.5 [&_h3]:mb-0.5",
        "[&_h4]:text-xs [&_h4]:font-semibold [&_h4]:mt-1.5 [&_h4]:mb-0.5",
        // Paragraphs
        "[&_p]:my-1 [&_p]:first:mt-0 [&_p]:last:mb-0",
        // Inline code
        "[&_code]:font-mono [&_code]:text-[12px] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-rose-600 dark:[&_code]:text-rose-400",
        // Code blocks
        "[&_pre]:bg-muted [&_pre]:border [&_pre]:rounded-md [&_pre]:p-2 [&_pre]:my-1.5 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:font-mono",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground",
        // Lists
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ul]:space-y-0.5",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_ol]:space-y-0.5",
        "[&_li]:text-sm",
        // Links
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80",
        // Blockquote
        "[&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-3 [&_blockquote]:my-1.5 [&_blockquote]:text-muted-foreground",
        // Strong/em
        "[&_strong]:font-semibold [&_em]:italic",
        // Horizontal rule
        "[&_hr]:border-muted-foreground/30 [&_hr]:my-2",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          // Open links in new tab safely
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Force code blocks to render with a wrapper for styling
          pre: ({ children }) => <pre>{children}</pre>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
