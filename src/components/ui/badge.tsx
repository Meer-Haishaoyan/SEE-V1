import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-blue-100/90 text-blue-700",
        secondary:
          "bg-gray-100/90 text-gray-800",
        destructive:
          "bg-red-100/90 text-red-700",
        outline:
          "bg-transparent text-gray-800 border border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
