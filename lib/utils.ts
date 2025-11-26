export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatUSPhone(input: string): string {
  const v = input.replace(/\D/g, "").slice(0, 10);

  if (v.length >= 7) {
    return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6)}`;
  } else if (v.length >= 4) {
    return `(${v.slice(0, 3)}) ${v.slice(3)}`;
  } else if (v.length >= 1) {
    return `(${v}`;
  }

  return "";
}

