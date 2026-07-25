# FinLock

O FinLock é uma plataforma web desenvolvida para a organização financeira pessoal. O objetivo do sistema é permitir que os usuários controlem suas receitas, despesas e investimentos de maneira visual, simples e intuitiva. 

O projeto foi estruturado com base em uma arquitetura Single Page Application (SPA), garantindo que, após a autenticação, todas as funcionalidades operem de forma centralizada em um único Dashboard interativo, eliminando a necessidade de redirecionamentos contínuos entre páginas.

---

## Requisitos Funcionais

O sistema contempla as seguintes operações centrais para o usuário:

* **RF01 - Landing Page:** Exibição da apresentação pública do sistema, seguida pelas opções de Cadastro e Login.
* **RF02 e RF03 - Acesso e Autenticação:** Registro de novos usuários e autenticação obrigatória (Login) para garantir a segurança no acesso às funcionalidades do sistema.
* **RF04 e RF05 - Gestão de Entradas e Saídas:** Módulo para registro detalhado de receitas e despesas organizadas por categorias, datas e valores, contando com cálculo de totalização automatizada.
* **RF06 - Resumo Financeiro:** Exibição de saldos consolidados e totalizadores de receitas e despesas, com atualização em tempo real.
* **RF07 - Painel de Gráficos:** Representação visual dos dados financeiros por meio de comparativos, com a vantagem de serem atualizados em tempo real.
* **RF08 - Painel de Investimentos:** Integração com API externa para o módulo de investimentos, contendo simulador de cenários que requer dados de valor inicial, aportes, taxa e período de tempo.

---

## Requisitos Não Funcionais

A arquitetura e a infraestrutura do sistema são regidas pelas seguintes diretrizes técnicas:

* **RNF01 e RNF02 - Plataforma e Arquitetura:** Implementação estrita de aplicação web baseada no padrão Single Page Application (SPA).
* **RNF03 - Performance:** Processamento de cálculos analíticos e atualização de dados executados em tempo real no Dashboard.
* **RNF04 - Segurança:** Aplicação de validações rigorosas em todos os dados inseridos nos campos de entrada e implementação de protocolos firmes para o processo de autenticação de usuários.

---

## Design System e Interface do Usuário (UI)

O projeto emprega uma paleta de cores formal, baseada em tons de verde e azul, projetada para transmitir segurança, crescimento e tranquilidade, sendo ideal para o contexto financeiro.

### Paleta de Cores Base
* `--evergreen`: `#002626ff`
* `--pearl-aqua`: `#94d1beff`
* `--onyx`: `#141414ff`
* `--light-cyan`: `#daf0eeff`
* `--ash-grey`: `#9db5b2ff`

### Comportamento de Temas (Light / Dark Mode)

Para assegurar acessibilidade, contraste adequado e evitar o cansaço visual, a interface aplica as seguintes distribuições de cores conforme o tema selecionado:

#### Modo Claro (Light Mode)
* **Background Principal:** `--light-cyan` (Utilizado como cor base para a página e grandes áreas, mantendo a interface limpa e iluminada).
* **Textos Principais e Tipografia:** `--onyx` (Aplicado em títulos, valores numéricos e textos principais para garantir alto contraste e legibilidade).
* **Ações e Marca:** `--evergreen` (Direcionado a botões de ação primária e cabeçalhos principais).
* **Destaques e Ações Secundárias:** `--pearl-aqua` (Aplicado em botões secundários, ícones, seleções ativas no menu e detalhes nos gráficos).
* **Elementos Neutros:** `--ash-grey` (Utilizado para delimitação de bordas dos painéis, divisórias e textos secundários).

#### Modo Escuro (Dark Mode)
* **Background Principal:** `--evergreen` (Cor base para a tela inteira, criando uma atmosfera imersiva e consolidando a identidade visual).
* **Superfícies e Cards:** `--onyx` (Fundo das áreas de destaque do Dashboard, criando o contraste de profundidade ideal sobre o fundo verde).
* **Textos e Tipografia:** `--light-cyan` (Garante excelente legibilidade e alto contraste para títulos e valores numéricos sobre os fundos escuros).
* **Ações e Destaques:** `--pearl-aqua` (Evidencia botões principais de ação, indicadores de saldo positivo, links e traçados de gráficos).
* **Elementos Neutros:** `--ash-grey` (Mantém a estruturação da interface através de bordas sutis para separar cards e textos de apoio).
