export async function fetchJson(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await Bun.sleep(400);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {}
  }
  throw new Error("Falha ao contatar o OpenMeteo. Verifique sua conexão.");
}
