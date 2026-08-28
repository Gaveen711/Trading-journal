import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Check } from 'lucide-react'
import { cx } from './utils'

interface FieldFrameProps {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
}

function FieldFrame({ id, label, hint, error, required, children, className }: FieldFrameProps) {
  return (
    <div className={cx('admin-field', Boolean(error) && 'admin-field--invalid', className)}>
      <label className="admin-field__label" htmlFor={id}>
        <span>{label}</span>
        {required && <span className="admin-field__required">Required</span>}
      </label>
      {children}
      {(hint || error) && (
        <p id={`${id}-${error ? 'error' : 'hint'}`} className="admin-field__message" role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  leadingIcon?: ReactNode
  containerClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id: suppliedId, label, hint, error, leadingIcon, className, containerClassName, required, ...props },
  ref,
) {
  const generatedId = useId()
  const id = suppliedId || generatedId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className={cx('admin-field__control', Boolean(leadingIcon) && 'admin-field__control--icon')}>
        {leadingIcon && <span className="admin-field__icon" aria-hidden="true">{leadingIcon}</span>}
        <input
          ref={ref}
          id={id}
          className={cx('admin-input', className)}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
      </div>
    </FieldFrame>
  )
})

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  options?: SelectOption[]
  containerClassName?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { id: suppliedId, label, hint, error, options, children, className, containerClassName, required, ...props },
  ref,
) {
  const generatedId = useId()
  const id = suppliedId || generatedId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <div className="admin-select-wrap">
        <select
          ref={ref}
          id={id}
          className={cx('admin-select', className)}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      </div>
    </FieldFrame>
  )
})

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  containerClassName?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { id: suppliedId, label, hint, error, className, containerClassName, required, ...props },
  ref,
) {
  const generatedId = useId()
  const id = suppliedId || generatedId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
      <textarea
        ref={ref}
        id={id}
        className={cx('admin-textarea', className)}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldFrame>
  )
})

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  hint?: ReactNode
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(
  { id: suppliedId, label, hint, className, ...props },
  ref,
) {
  const generatedId = useId()
  const id = suppliedId || generatedId
  return (
    <label className={cx('admin-checkbox', className)} htmlFor={id}>
      <span className="admin-checkbox__control">
        <input ref={ref} id={id} type="checkbox" {...props} />
        <span className="admin-checkbox__box" aria-hidden="true"><Check /></span>
      </span>
      <span className="admin-checkbox__copy">
        <span className="admin-checkbox__label">{label}</span>
        {hint && <span className="admin-checkbox__hint">{hint}</span>}
      </span>
    </label>
  )
})

export { FieldFrame }
