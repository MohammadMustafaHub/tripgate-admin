import { useState, type ComponentProps } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { cn } from 'cn'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Password field with a show/hide toggle. The toggle sits on the inline-end
 * edge, so it follows the document direction.
 */
function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        dir="rtl"
        className={cn('pe-8 text-start placeholder:text-start', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        aria-pressed={visible}
        className="absolute inset-y-0 end-1 my-auto text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

export { PasswordInput }
