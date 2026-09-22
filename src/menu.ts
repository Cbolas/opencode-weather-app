import { geocode, getTemperature } from "./api.ts";
import { bold, cyan, green, red, yellow } from "./colors.ts";
import { saveConfig } from "./storage.ts";
import type { City, Config, Unit } from "./types.ts";

const LINE = "═".repeat(40);

export function ask(message: string): string | null {
  const answer = prompt(message);
  return answer === null ? null : answer.trim();
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  const region = city.admin1 ? ` (${city.admin1})` : "";
  const country = city.country ? `, ${city.country}` : "";
  return `${city.name}${region}${country}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

export function printMenu(config: Config): void {
  console.log("");
  console.log(cyan(LINE));
  console.log(`         ${cyan(bold("WEATHER CLI"))}`);
  console.log(cyan(LINE));
  console.log(`  ${cyan("1.")} Clima da cidade padrão`);
  console.log(`  ${cyan("2.")} Clima de todas as cidades (${config.cities.length})`);
  console.log(`  ${cyan("3.")} Buscar e adicionar cidade`);
  console.log(`  ${cyan("4.")} Remover cidade`);
  console.log(`  ${cyan("5.")} Definir cidade padrão`);
  console.log(`  ${cyan("8.")} Configurações (${unitSymbol(config.unit)})`);
  console.log(`  ${cyan("9.")} Sair`);
  console.log(cyan(LINE));
}

function printCityList(config: Config): void {
  config.cities.forEach((city, index) => {
    const marker = config.defaultCity?.id === city.id ? " (padrão)" : "";
    console.log(`   ${index + 1}. ${formatCity(city)}${marker}`);
  });
}

async function printWeather(city: City, unit: Unit): Promise<void> {
  try {
    const temperature = await getTemperature(city, unit);
    console.log(`  ${formatCity(city)} — ${yellow(bold(`${temperature} ${unitSymbol(unit)}`))}`);
  } catch (error) {
    console.log(`  ${formatCity(city)} — ${red(`indisponível (${errorMessage(error)})`)}`);
  }
}

export async function showDefaultWeather(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log("  Nenhuma cidade padrão definida.");
    const answer = ask("  Deseja definir agora? (s/n): ");
    if (answer !== null && answer.toLowerCase() === "s") await setDefaultCity(config);
    return;
  }
  await printWeather(config.defaultCity, config.unit);
}

export async function showAllWeather(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  Nenhuma cidade cadastrada. Use a opção 3 para adicionar.");
    return;
  }
  console.log("  Clima de todas as cidades:");
  await Promise.all(config.cities.map((city) => printWeather(city, config.unit)));
}

export async function addCity(config: Config): Promise<void> {
  const name = ask("  Nome da cidade: ");
  if (!name) return;
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`  Cidade não encontrada: "${name}"`));
      return;
    }
    if (config.cities.some((existing) => existing.id === city.id)) {
      console.log(`  Já cadastrada: ${formatCity(city)}`);
      return;
    }
    config.cities.push(city);
    await saveConfig(config);
    console.log(green(`  Adicionada: ${formatCity(city)}`));
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
  }
}

export async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("  Nenhuma cidade cadastrada.");
    return;
  }
  console.log("  Cidades cadastradas:");
  printCityList(config);
  const answer = ask("  Número da cidade a remover (0 para cancelar): ");
  const number = answer === null ? Number.NaN : Number(answer);
  if (!Number.isInteger(number) || number < 0 || number > config.cities.length) {
    console.log(red("  Número inválido."));
    return;
  }
  if (number === 0) return;
  const city = config.cities[number - 1];
  if (!city) {
    console.log(red("  Número inválido."));
    return;
  }
  config.cities = config.cities.filter((existing) => existing.id !== city.id);
  if (config.defaultCity?.id === city.id) config.defaultCity = undefined;
  await saveConfig(config);
  console.log(green(`  Removida: ${formatCity(city)}`));
}

async function setDefaultBySearch(config: Config): Promise<void> {
  const name = ask("  Nome da cidade: ");
  if (!name) return;
  try {
    const city = await geocode(name);
    if (!city) {
      console.log(red(`  Cidade não encontrada: "${name}"`));
      return;
    }
    if (!config.cities.some((existing) => existing.id === city.id)) {
      config.cities.push(city);
      console.log(green(`  Adicionada: ${formatCity(city)}`));
    }
    config.defaultCity = city;
    await saveConfig(config);
    console.log(green(`  Cidade padrão definida: ${formatCity(city)}`));
  } catch (error) {
    console.log(red(`  ${errorMessage(error)}`));
  }
}

export async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    await setDefaultBySearch(config);
    return;
  }
  console.log("  Cidades cadastradas:");
  printCityList(config);
  console.log("   0. Buscar por nome");
  const answer = ask("  Escolha a cidade padrão: ");
  if (answer === "0") {
    await setDefaultBySearch(config);
    return;
  }
  const number = answer === null ? Number.NaN : Number(answer);
  const city = Number.isInteger(number) ? config.cities[number - 1] : undefined;
  if (!city || number < 1) {
    console.log(red("  Escolha inválida."));
    return;
  }
  config.defaultCity = city;
  await saveConfig(config);
  console.log(green(`  Cidade padrão definida: ${formatCity(city)}`));
}

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
  await saveConfig(config);
  console.log(green(`  Unidade salva: ${unitSymbol(config.unit)}`));
}
