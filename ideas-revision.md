# Revisão Weather CLI

* [x] **Cores:** implementadas em `src/colors.ts` — ciano (menu), amarelo (temp), verde/vermelho (ok/erro); respeita `NO_COLOR`/isTTY e `FORCE_COLOR` força.
* [ ] **AGENTS.md:** diz que `index.ts` é stub, mas o app já funciona — é preciso atualizá-lo.
* [ ] **Cidades:** o geocoding só traz 1 resultado; nomes ambíguos podem falhar.
* [ ] **Testes:** não existem; convém ao menos testar storage e as APIs com mocks.
* [ ] **Binário:** compila bem; revisar se `./weather` salva dados em `~/.config/weather-cli/`.
* [ ] **Escalabilidade:** quão fácil será expandir com novas funcionalidades?
* [ ] **Carregamento:** há estado de carregamento nas tarefas assíncronas?
* [ ] **Previsão para 7 dias:** adicionar a possibilidade de obter a previsão do clima para os próximos 7 dias