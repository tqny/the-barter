import { useState } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

export function GenerationExplainer({ explanation }: { explanation: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="size-3 shrink-0" />
        <span>How this was generated</span>
        {open ? <ChevronUp className="ml-auto size-3" /> : <ChevronDown className="ml-auto size-3" />}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed font-sans">
            {explanation}
          </pre>
        </div>
      )}
    </div>
  )
}
