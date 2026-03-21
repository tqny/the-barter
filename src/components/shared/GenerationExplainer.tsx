import { Info } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export function GenerationExplainer({ explanation }: { explanation: string }) {
  return (
    <Popover>
      <PopoverTrigger
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="size-3 shrink-0" />
        <span>How this was generated</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] !rounded-xl p-0 border-0 shadow-2xl shadow-black/40 ring-0"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div
          className="rounded-xl p-4 space-y-2.5 max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--background) 85%, black)',
            border: '1px solid color-mix(in srgb, var(--chart-2) 35%, transparent)',
          }}
        >
          <div className="flex items-center gap-2">
            <Info className="size-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Methodology</span>
          </div>
          <div className="h-px bg-white/10" />
          <pre className="whitespace-pre-wrap text-[12px] text-white/75 leading-relaxed font-sans font-medium tracking-tight">
            {explanation}
          </pre>
        </div>
      </PopoverContent>
    </Popover>
  )
}
