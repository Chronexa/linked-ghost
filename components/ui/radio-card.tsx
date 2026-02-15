import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface RadioCardProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    description?: string
    icon?: React.ReactNode
}

export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(
    ({ className, label, description, icon, ...props }, ref) => {
        return (
            <label className={cn(
                "relative flex cursor-pointer flex-col rounded-xl border border-input p-4 shadow-sm transition-all hover:border-brand/50 hover:bg-muted/30 has-[:checked]:border-brand has-[:checked]:bg-brand/5 has-[:checked]:ring-1 has-[:checked]:ring-brand ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                className
            )}>
                <input
                    type="radio"
                    className="peer sr-only"
                    ref={ref}
                    {...props}
                />
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-muted-foreground peer-checked:text-brand">{icon}</div>}
                        <div>
                            <p className="font-medium text-foreground">{label}</p>
                            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                        </div>
                    </div>
                    <div className="opacity-0 peer-checked:opacity-100 text-brand transition-opacity">
                        <Check className="h-4 w-4" />
                    </div>
                </div>
            </label>
        )
    }
)
RadioCard.displayName = "RadioCard"
