import * as React from "react"

import { cn } from "../../lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-nextgen border border-nextgen-teal/30 bg-nextgen-dark-blue px-3 py-2 text-sm text-nextgen-white ring-offset-nextgen-dark-blue file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-nextgen-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextgen-teal focus-visible:ring-offset-2 focus-visible:border-nextgen-teal disabled:cursor-not-allowed disabled:opacity-50 shadow-nextgen transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
