"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Option {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
}

interface SelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    placeholder?: string
    className?: string
    align?: "start" | "end" | "center"
}

export function Select({ value, onChange, options, placeholder = "Select...", className, align = "start" }: SelectProps) {
    const selectedOption = options.find((opt) => opt.value === value)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    role="combobox"
                    className={cn("w-full justify-between font-normal bg-background hover:bg-accent/50", className)}
                >
                    <span className="flex items-center gap-2 truncate">
                        {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 text-muted-foreground" />}
                        {selectedOption ? selectedOption.label : <span className="text-muted-foreground">{placeholder}</span>}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => onChange(option.value)}
                        className="gap-2 cursor-pointer"
                    >
                        {option.icon && <option.icon className={cn("h-4 w-4", value === option.value ? "text-brand" : "text-muted-foreground")} />}
                        <span className={cn("flex-1", value === option.value && "font-medium")}>{option.label}</span>
                        {value === option.value && <Check className="h-4 w-4 text-brand" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
