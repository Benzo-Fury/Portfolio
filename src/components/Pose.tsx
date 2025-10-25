import type { ReactNode } from "react"

interface ProseProps {
  children: ReactNode
}

export function Prose({ children }: ProseProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-light prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-a:text-foreground prose-a:underline prose-a:decoration-muted-foreground/50 hover:prose-a:decoration-foreground prose-a:transition-colors prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-hr:border-border">
      {children}
    </div>
  )
}