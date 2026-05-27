# Sistema de Escalas IEADPE - Filial Aracoiaba

Sistema web para gerenciamento de escalas oficiais e locais da IEADPE Filial Aracoiaba, com sincronizacao em Google Sheets, controle de obreiros, congregacoes, eventos e regras automaticas por semana.

## Visao geral

Este projeto centraliza a montagem e manutencao das escalas ministeriais da filial em uma interface unica.

Ele permite:

- montar a escala oficial da semana;
- montar a escala local da semana;
- gerenciar pontos de pregacao e portaria;
- cadastrar obreiros e congregacoes;
- controlar eventos e festividades;
- aplicar regras automaticas de culto por semana do mes;
- sincronizar todos os dados com uma planilha no Google Sheets;
- imprimir a escala oficial e a escala local.

## Tecnologias utilizadas

- React 19
- TypeScript
- Vite
- Express
- Google Sheets API
- Tailwind CSS v4
- date-fns
- lucide-react
- motion

## Como a aplicacao funciona

O projeto roda com um unico servidor `Express` em [`server.ts`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/server.ts), que:

- entrega o frontend React durante o desenvolvimento via middleware do Vite;
- serve os arquivos estaticos da pasta `dist` em producao;
- expone rotas REST para leitura e escrita no Google Sheets.

O frontend principal fica em [`src/App.tsx`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/src/App.tsx) e concentra toda a interface administrativa.

## Modulos da interface

### 1. Escala Oficial

Painel principal para montar a escala semanal oficial por dia da semana.

Funcionalidades:

- escolha da semana base;
- edicao de congregacao, codigo e escalados;
- adicao e remocao de linhas;
- deteccao de conflito quando o mesmo obreiro e escalado no mesmo dia em locais diferentes;
- impressao da escala oficial.

Dias controlados no sistema:

- segunda-feira a noite;
- terca-feira a noite;
- quarta-feira a noite;
- quinta-feira manha;
- quinta-feira tarde;
- quinta-feira noite;
- sexta-feira a noite;
- sabado a noite;
- domingo manha;
- domingo noite.

### 2. Escala Local

Modulo para escalas complementares e operacionais.

Inclui:

- C.O. local;
- ponto de pregacao (`PP`);
- portaria;
- impressao da escala local.

Cada linha permite informar:

- categoria;
- dia;
- local;
- codigo;
- escalados.

### 3. Congregacoes

Cadastro das congregacoes com dados administrativos.

Campos utilizados:

- nome;
- endereco;
- responsavel;
- data de inauguracao;
- departamentos em JSON.

### 4. Obreiros

Cadastro da base de obreiros usada nos campos de escala.

Campos utilizados:

- nome;
- cargo;
- congregacao.

### 5. Calendario

Area para registro de eventos e festividades.

Campos utilizados:

- data;
- descricao;
- cc;
- congregacao.

### 6. Configuracoes

Painel de sincronizacao e automacao.

Recursos:

- salvar dados na nuvem;
- executar o robo de escala;
- aplicar regras de culto com base na semana do mes.

## Regras automaticas

O metodo `aplicarRegrasGerais()` em [`src/App.tsx`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/src/App.tsx) percorre a escala oficial e ajusta os codigos de culto conforme:

- congregacao;
- dia da semana;
- semana do mes;
- mapeamento de tipos de culto.

Essas regras sao carregadas da aba `RegrasCulto` da planilha.

## Sincronizacao com Google Sheets

O backend usa uma conta de servico do Google para acessar a planilha configurada nas variaveis de ambiente.

### Variaveis de ambiente

Use o arquivo `.env` com base em [`.env.example`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/.env.example):

```env
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### Descricao das variaveis

- `GOOGLE_SHEETS_ID`: ID da planilha do Google Sheets.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: email da conta de servico.
- `GOOGLE_PRIVATE_KEY`: chave privada da conta de servico. Se estiver em uma unica linha, o backend converte `\\n` para quebra de linha real.

### Permissoes necessarias

Antes de usar a sincronizacao:

1. crie uma conta de servico no Google Cloud;
2. habilite a Google Sheets API;
3. compartilhe a planilha com o email da conta de servico;
4. configure as variaveis de ambiente.

## Estrutura esperada da planilha

O sistema espera as seguintes abas no Google Sheets:

- `Obreiros`
- `Congregacoes`
- `EscalaOficial`
- `EscalaLocal`
- `Eventos`
- `TiposCulto`
- `RegrasCulto`

### Colunas usadas por aba

#### `Obreiros`

- `A`: nome
- `B`: cargo
- `C`: congregacao

#### `Congregacoes`

- `A`: nome
- `B`: endereco
- `C`: responsavelNome
- `D`: dataInauguracao
- `E`: departamentos em JSON

#### `EscalaOficial`

- `A`: data de inicio da semana
- `B`: identificador do dia
- `C`: congregacao
- `D`: codigo
- `E`: escalados separados por virgula

#### `EscalaLocal`

- `A`: data de inicio da semana
- `B`: categoria
- `C`: identificador do dia
- `D`: local
- `E`: codigo
- `F`: escalados separados por virgula

#### `Eventos`

- `A`: data
- `B`: descricao
- `C`: cc
- `D`: congregacao

#### `TiposCulto`

- `A`: nome
- `B`: codigo

#### `RegrasCulto`

- `A`: congregacao
- `B`: dia
- `C` em diante: regra por semana do mes

## Rotas da API

As rotas estao definidas em [`server.ts`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/server.ts).

### `GET /api/status`

Retorna se o Google Sheets esta configurado.

Exemplo de resposta:

```json
{
  "configured": true
}
```

### `GET /api/sync`

Baixa em lote os dados principais da planilha:

- obreiros;
- congregacoes;
- escala oficial;
- escala local;
- eventos;
- tipos de culto;
- regras de culto.

### `GET /api/sheets/:range`

Le um intervalo especifico da planilha.

Exemplo:

```txt
/api/sheets/Obreiros!A:C
```

### `POST /api/sheets/update`

Atualiza um intervalo especifico da planilha.

Exemplo de payload:

```json
{
  "range": "Obreiros!A:C",
  "values": [
    ["Nome", "Cargo", "Congregacao"]
  ]
}
```

## Scripts disponiveis

Definidos em [`package.json`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/package.json):

- `npm run dev`: inicia o servidor Express com `tsx server.ts`;
- `npm run build`: gera a build de producao com Vite;
- `npm run preview`: abre a visualizacao da build;
- `npm run lint`: executa verificacao de tipos com TypeScript;
- `npm run clean`: remove a pasta `dist`.

Observacao:

- o script `clean` usa `rm -rf dist`, que pode nao funcionar no PowerShell puro do Windows sem um ambiente Unix compatível. Se necessario, adapte para um comando compativel com Windows.

## Como executar localmente

### Requisitos

- Node.js instalado
- npm instalado
- credenciais do Google Sheets configuradas

### Passo a passo

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` com base no `.env.example`.

3. Inicie o projeto:

```bash
npm run dev
```

4. Acesse:

```txt
http://localhost:3000
```

## Build de producao

1. Gere os arquivos:

```bash
npm run build
```

2. Defina `NODE_ENV=production`.

3. Inicie o servidor com a mesma entrada `server.ts` usando seu processo de deploy preferido.

Em producao, o servidor:

- serve os arquivos da pasta `dist`;
- responde as rotas `/api/*`;
- entrega `index.html` para as rotas da SPA.

## Estrutura de pastas

```txt
.
|-- src/
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- teste/
|-- .env.example
|-- index.html
|-- package.json
|-- server.ts
|-- tsconfig.json
`-- vite.config.ts
```

## Arquivos principais

- [`src/App.tsx`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/src/App.tsx): interface principal e regras de negocio do frontend.
- [`server.ts`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/server.ts): servidor Express, integracao com Vite e Google Sheets API.
- [`src/main.tsx`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/src/main.tsx): bootstrap do React.
- [`src/index.css`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/src/index.css): estilos globais e ajustes de impressao.
- [`package.json`](D:/Users/Jose%20Menezes/Desktop/Projeto%20escala/package.json): dependencias e scripts.

## Dados padrao no frontend

O sistema possui dados padrao embutidos no frontend para facilitar o primeiro carregamento quando a planilha ainda nao possui conteudo em algumas secoes, incluindo:

- congregacoes iniciais;
- obreiros iniciais;
- tipos de culto;
- regras de culto;
- escala local padrao.

Isso ajuda a interface a continuar funcional mesmo antes da primeira sincronizacao completa.

## Comportamentos importantes

- o sistema verifica conflitos de escala no mesmo dia e alerta quando um obreiro e duplicado em locais diferentes;
- a escala oficial e filtrada pela `dataInicio` da semana;
- a escala local tambem e salva vinculada a `dataInicio`;
- eventos podem ser cadastrados e editados diretamente na interface;
- impressao esconde controles e reorganiza o layout para papel.

## Pontos de atencao

- o backend hoje usa `PORT = 3000` fixo;
- a maior parte da regra de negocio esta centralizada em um unico componente React grande;
- alguns textos no codigo-fonte apresentam problemas de acentuacao, o que pode indicar questao de encoding em partes do projeto;
- o projeto depende da estrutura exata das abas do Google Sheets para sincronizar corretamente.

## Melhorias recomendadas

- separar o `App.tsx` em componentes menores;
- mover tipos e constantes para arquivos dedicados;
- validar payloads no backend;
- adicionar testes para regras de escalas e sincronizacao;
- tornar a porta configuravel por variavel de ambiente;
- substituir o script `clean` por uma versao compativel com Windows.

## Resumo

Este projeto e um painel administrativo completo para gestao de escalas eclesiasticas, combinando:

- interface React para operacao diaria;
- backend Express para integracao;
- Google Sheets como base de dados;
- regras automaticas para agilizar a montagem das escalas.

Se quiser, no proximo passo eu posso tambem:

1. ajustar o `package.json` para Windows;
2. corrigir os textos com acentuacao quebrada no projeto;
3. fazer o commit com uma mensagem pronta e segura.
