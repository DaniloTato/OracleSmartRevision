//move text input props into a type files
interface TextInputProps {
    id?: string
    type?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    autoComplete?: string
    required?: boolean
    disabled?: boolean
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
            onChange={(e) => onChange(e.target.value)}
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
        />
    )
}
