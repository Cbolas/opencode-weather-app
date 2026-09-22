## Weather CLI APP

O objetivo desta aplicação é criarmos uma aplicação de linha de comando (console) que solicite a inserção de uma cidade. Ao final, geraremos um binário executável.

### Opções:

- Inserir o nome de uma cidade.
- Salvar a cidade padrão.
- Cadastrar várias outras cidades para consultar o clima nessas localidades.

## Stack

- Bun.js
- OpenMeteo

## Exemplo de requisição HTTP:

1. Passo 1: Geocoding API.
2. Passo 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Inicializar projeto

```bash
bun init
```

Exemplo do menu
Esta é a aparência que desejamos criar:

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima da cidade padrão
  2. Clima de todas as cidades (1)
  3. Buscar e adicionar cidade
  4. Remover cidade
  5. Definir cidade padrão
  6. Previsão para 7 dias
  7. Listar cidades
  8. Configurações (°C)
  9. Sair
════════════════════════════════════════
  Selecione uma opção: 5
```