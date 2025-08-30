import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-nextgen border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nextgen-teal focus:ring-offset-2 shadow-nextgen",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nextgen-teal text-nextgen-dark-gray hover:bg-nextgen-teal-hover",
        secondary:
          "border-transparent bg-nextgen-light-blue text-nextgen-white hover:bg-nextgen-light-blue/80",
        destructive:
          "border-transparent bg-nextgen-error text-nextgen-white hover:bg-nextgen-error/80",
        success:
          "border-transparent bg-nextgen-success text-nextgen-white hover:bg-nextgen-success/80",
        warning:
          "border-transparent bg-nextgen-warning text-nextgen-dark-gray hover:bg-nextgen-warning/80",
        outline: "text-nextgen-white border-nextgen-teal/30 hover:bg-nextgen-teal/10",
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
