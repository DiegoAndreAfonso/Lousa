# Lousa

**Lousa** é uma plataforma de atividades e avaliações online desenvolvida para auxiliar professores na criação, aplicação e correção de avaliações, além de facilitar a participação dos alunos e o acompanhamento dos resultados.

A plataforma busca centralizar as etapas do processo avaliativo em um ambiente intuitivo, permitindo que professores gerenciem avaliações e acompanhem o desempenho dos alunos, enquanto os estudantes acessam as atividades por meio de códigos ou links de participação.

O projeto está sendo desenvolvido com React e TypeScript no front-end e terá um back-end em Laravel, responsável pela autenticação, regras de negócio, persistência dos dados e comunicação com a aplicação.

## Objetivos

- Simplificar a criação e o gerenciamento de avaliações online.
- Facilitar a aplicação de atividades por meio de códigos e links de acesso.
- Automatizar a correção de questões objetivas.
- Permitir a correção manual de questões discursivas.
- Disponibilizar notas e feedbacks após a liberação pelo professor.
- Preservar respostas e o andamento das avaliações durante a participação dos alunos.
- Preparar a plataforma para oferecer autenticação, persistência centralizada e acesso seguro aos dados.
- Possibilitar futuras integrações com um aplicativo dedicado à realização de avaliações.

## Funcionalidades

### Professor

- **Painel inicial:** acompanhamento de indicadores, aplicações recentes, próximas atividades e respostas aguardando correção.
- **Avaliações:** criação, edição, duplicação e arquivamento de avaliações.
- **Editor de questões:** criação de questões de alternativa única, verdadeiro ou falso e resposta aberta, com definição de pontuação e visualização prévia.
- **Materiais de apoio:** cadastro e consulta de links e arquivos relacionados às avaliações.
- **Aplicações:** configuração de períodos de disponibilidade, duração, identificação dos participantes e regras de acesso.
- **Compartilhamento:** geração de códigos e links para participação dos alunos.
- **Resultados:** consulta das participações, correção de questões discursivas, registro de feedbacks e controle da liberação dos resultados.
- **Conta:** gerenciamento das informações do perfil do professor.

### Aluno

- Acesso às avaliações por código ou link.
- Identificação conforme as regras definidas pelo professor.
- Consulta às instruções e aos materiais de apoio.
- Navegação entre as questões.
- Salvamento de respostas durante a avaliação.
- Revisão das respostas antes da entrega.
- Entrega ou desistência da participação.
- Consulta às notas e aos feedbacks após a liberação pelo professor.

### Regras de avaliação

- Correção automática de questões objetivas.
- Correção manual de questões discursivas.
- Controle de disponibilidade e duração das aplicações.
- Preservação das respostas finais após a conclusão da participação.
- Separação entre o estado da participação, o estado da correção e a liberação do resultado.
- Preservação do conteúdo das avaliações já publicadas, mesmo quando a avaliação original é alterada posteriormente.

## Tecnologias

### Front-end

- React
- TypeScript
- Vite
- React Router
- CSS
- Lucide Icons
- Vitest
- Playwright

### Back-end

- Laravel
- PHP
- API REST

### Persistência e integrações

A implementação atual do front-end utiliza armazenamento local do navegador para demonstrar os fluxos da aplicação.

Com o desenvolvimento do back-end, a persistência será centralizada em um banco de dados, e as funcionalidades passarão a utilizar uma API para comunicação entre as aplicações.

A tecnologia do banco de dados e as demais integrações de infraestrutura serão definidas conforme a implementação do back-end.

## Arquitetura do projeto

O projeto será organizado em duas aplicações independentes, integradas por meio de uma API REST.

### Front-end

Responsável pela interface, navegação, formulários, experiência de uso e apresentação dos dados.

Principais responsabilidades:

- Interface do professor e do aluno.
- Criação e edição de avaliações.
- Participação nas aplicações.
- Exibição e correção de resultados.
- Comunicação com a API.
- Validação de formulários e apresentação de mensagens de erro.

### Back-end

Responsável pelo processamento das requisições, aplicação das regras de negócio, autenticação e gerenciamento dos dados.

Principais responsabilidades previstas:

- Autenticação e gerenciamento de usuários.
- Gerenciamento de avaliações e questões.
- Cadastro e gerenciamento de materiais.
- Criação e controle das aplicações.
- Validação das regras de participação.
- Registro e persistência das respostas.
- Correção automática e manual.
- Controle de acesso aos resultados.
- Gerenciamento de arquivos e materiais de apoio.
- Disponibilização dos dados por meio de uma API REST.

## Estrutura dos repositórios

A estrutura poderá ser organizada da seguinte forma:

```text
lousa/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   ├── composer.json
│   └── README.md
│
└── README.md
