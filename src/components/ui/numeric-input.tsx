/**
 * NumericInput.tsx — Wrapper shadcn/ui Input + react-number-format.
 *
 * Tính năng:
 * - Tự động strip leading zeros (allowLeadingZeros=false default)
 * - inputMode="numeric" cho mobile keyboard tối ưu
 * - Tương thích react-hook-form qua setValue + watch pattern
 * - Forward ref cho accessibility
 */
'use client'

import { forwardRef } from 'react'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface NumericInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange' | 'customInput'> {
  value: number | undefined | null
  onValueChange: (value: number | undefined) => void
  error?: string
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, error, className, ...props }, ref) => {
    return (
      <NumericFormat
        {...props}
        customInput={Input}
        getInputRef={ref}
        className={cn(className, error && 'border-destructive')}
        value={value ?? ''}
        onValueChange={(values) => {
          onValueChange(values.floatValue === undefined ? undefined : values.floatValue)
        }}
        thousandSeparator={false}
        decimalScale={0}
        allowNegative={false}
        inputMode="numeric"
      />
    )
  },
)
NumericInput.displayName = 'NumericInput'
