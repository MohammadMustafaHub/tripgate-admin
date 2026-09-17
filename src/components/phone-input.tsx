import type { ComponentProps } from 'react'
import { cn } from 'cn'

import { Input } from '@/components/ui/input'

/**
 * Field for Iraqi mobile numbers. Accepts 7…, 07… and 9647… — run the value
 * through normalizeIraqiPhone before sending it to the API.
 */
function PhoneInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      dir="rtl"
      placeholder="07XXXXXXXXX"
      className={cn('text-start placeholder:text-start', className)}
      {...props}
    />
  )
}

export { PhoneInput }
