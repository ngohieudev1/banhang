import { useId } from "react";

type CheckoutFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
};

export default function CheckoutField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  defaultValue,
}: CheckoutFieldProps) {
  const uid = useId();
  const id = `${name}-${uid}`;

  return (
    <div className="rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 transition-colors focus-within:border-foreground-900">
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-500"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="mt-1 w-full bg-transparent text-sm text-foreground-950 outline-none placeholder:text-foreground-400"
      />
    </div>
  );
}