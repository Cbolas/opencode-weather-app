export function ask(message: string): string | null {
  const answer = prompt(message);
  return answer === null ? null : answer.trim();
}
