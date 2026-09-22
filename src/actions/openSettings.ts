import { ask } from "../presentation/input.ts";
import { saveUnit } from "../storage/settingsStorage.ts";
import { green, red } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";
import type { Config } from "../types/Config.ts";

export async function openSettings(config: Config): Promise<void> {
  console.log(`  Unidade de temperatura: ${unitSymbol(config.unit)}`);
  const other = config.unit === "celsius" ? "°F" : "°C";
  console.log(`  1. Alternar para ${other}`);
  console.log("  0. Voltar");
  const answer = ask("  Selecione: ");
  if (answer === null || answer === "0") return;
  if (answer !== "1") {
    console.log(red("  Opção inválida."));
    return;
  }
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveUnit(config.unit);
  console.log(green(`  Unidade salva: ${unitSymbol(config.unit)}`));
}
