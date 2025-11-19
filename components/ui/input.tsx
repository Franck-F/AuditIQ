import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // If a `value` prop is provided, coerce undefined -> '' to avoid
    // switching from uncontrolled to controlled inputs during updates.
    const hasValueProp = Object.prototype.hasOwnProperty.call(props, 'value')
    const valueProp = (props as any).value

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...(hasValueProp ? { ...props, value: valueProp ?? '' } : props)}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
