import { afterEach, describe, expect, test } from "bun:test";
import { fetchJson } from "../../src/api/client.ts";
import { installFetch, restoreGlobals } from "../helpers.ts";

afterEach(restoreGlobals);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status });
}

describe("fetchJson", () => {
  test("retorna o JSON de uma resposta bem-sucedida", async () => {
    const fetchMock = installFetch(() => jsonResponse({ results: [1, 2] }));
    expect(await fetchJson("https://exemplo.test/api")).toEqual({ results: [1, 2] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("repete uma vez após erro HTTP e devolve a segunda resposta", async () => {
    let call = 0;
    const fetchMock = installFetch(() => {
      call += 1;
      return call === 1 ? jsonResponse({ error: true }, 500) : jsonResponse({ ok: true });
    });
    expect(await fetchJson("https://exemplo.test/api")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual(["https://exemplo.test/api", "https://exemplo.test/api"]);
  });

  test("falha com mensagem amigável quando as duas tentativas recebem erro HTTP", async () => {
    installFetch(() => jsonResponse({}, 500));
    await expect(fetchJson("https://exemplo.test/api")).rejects.toThrow(
      "Falha ao contatar o OpenMeteo. Verifique sua conexão.",
    );
  });

  test("trata falha de rede com a mesma mensagem amigável", async () => {
    installFetch(() => {
      throw new Error("boom de rede");
    });
    await expect(fetchJson("https://exemplo.test/api")).rejects.toThrow(
      "Falha ao contatar o OpenMeteo. Verifique sua conexão.",
    );
  });
});
