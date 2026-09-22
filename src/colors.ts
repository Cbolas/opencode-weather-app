function colorEnabled(): boolean {
  const forceColor = process.env.FORCE_COLOR;
  if (forceColor !== undefined && forceColor !== "0" && forceColor !== "false") return true;
  const noColor = process.env.NO_COLOR;
  if (noColor !== undefined && noColor !== "") return false;
  return process.stdout.isTTY === true;
}

const ENABLED = colorEnabled();

function paint(code: string, text: string): string {
  return ENABLED ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export function cyan(text: string): string {
  return paint("36", text);
}

export function yellow(text: string): string {
  return paint("33", text);
}

export function green(text: string): string {
  return paint("32", text);
}

export function red(text: string): string {
  return paint("31", text);
}

export function bold(text: string): string {
  return paint("1", text);
}
