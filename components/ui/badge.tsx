import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "draft" | "sent" | "signed" | "paid"
}

const variantStyles: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  draft: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-purple-100 text-purple-700",
  paid: "bg-emerald-100 text-emerald-700",
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
      {...props}
    />
  )
}
