export function Ms({ icon, outline }: { icon: string; outline?: boolean }) {
  return <span className={"ms" + (outline ? " ms-outline" : "")}>{icon}</span>;
}
