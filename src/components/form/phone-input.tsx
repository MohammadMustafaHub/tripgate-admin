import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function PhoneInput(props: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <InputGroup dir="ltr" className="h-9 bg-card">
      <InputGroupAddon>+964</InputGroupAddon>
      <InputGroupInput
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="7XX XXX XXXX"
        {...props}
      />
    </InputGroup>
  );
}
