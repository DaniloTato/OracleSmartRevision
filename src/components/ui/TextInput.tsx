import type { ChangeEvent, InputHTMLAttributes } from 'react'

type TextInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange'
> & {
    onChange: (value: string) => void
}

export function TextInput({
    id,
    type = 'text',
    value,
    onChange,
    placeholder,
    autoComplete,
    required,
    disabled,
    ...rest
}: TextInputProps) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange(e.target.value)
            }
            className="
                w-full
                px-3
                py-2
                text-sm
                text-[var(--color-text)]
                bg-surface
                border
                border-default
                rounded-lg
                outline-none
                focus:border-primary
                transition-colors
            "
            {...rest}
        />
    )
}
