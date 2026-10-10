# Lousa

Front-end demonstrativo de uma plataforma de atividades e avaliações voltada ao professor. A interface está em português do Brasil e permite percorrer a criação da avaliação, publicação de uma aplicação, participação do aluno, correção e liberação do resultado.

## Instalação e execução

Requisitos: Node.js 20.19 ou superior, npm e um navegador moderno com localStorage e IndexedDB habilitados.

```bash
npm ci
npm run dev
```

Abra o endereço local indicado pelo Vite. Para gerar e visualizar a versão compilada:

```bash
npm run build
npm run preview
```

Verificações disponíveis:

```bash
npm run typecheck
npm test
```

`npm test` executa os testes de domínio com Vitest. O build também verifica os tipos antes de gerar os arquivos em `dist/`. Ao hospedar o front-end, configure o servidor para retornar `index.html` nas rotas da aplicação.

Para executar os testes de percurso no navegador, instale o Chromium usado pelo Playwright e execute:

```bash
npx playwright install chromium
npm run test:e2e
```

A configuração inicia o servidor de desenvolvimento em `http://127.0.0.1:5173` ou reutiliza um servidor já ativo nesse endereço. Cada teste usa um contexto de navegador independente. Para verificar somente os cenários públicos:

```bash
npx playwright test tests/browser/student.spec.ts --workers=1
```

## Acesso à demonstração

O painel do professor começa em `/login`. Use `marina@exemplo.com`, já preenchido, ou outro e-mail fictício válido. A entrada abre o perfil fictício de Marina Costa, professora de Biologia da Escola Horizonte. Não há senha, credenciais reais, autenticação de produção, checkout ou cobrança.

O aluno acessa `/participar`, informa um código ou abre diretamente `/p/:codigo`. As rotas públicas apresentam somente o fluxo da atividade, sem o menu do professor. O login demonstrativo é um marcador local para a navegação do painel; ele não oferece autorização de segurança.

| Código   | Atividade                   | Cenário inicial                                                              |
| -------- | --------------------------- | ---------------------------------------------------------------------------- |
| `BIO101` | Ecologia e sustentabilidade | Aberta, identificação por nome, 45 minutos                                   |
| `MAT202` | Funções do primeiro grau    | Aberta, e-mail autorizado, 50 minutos                                        |
| `FIS303` | Movimento e velocidade      | Aberta, identificação por nome e aplicativo simulado obrigatório, 60 minutos |
| `GEO404` | Paisagens e território      | Abertura futura, dois dias após a inicialização dos exemplos                 |
| `HIS505` | Memórias da comunidade      | Aplicação encerrada                                                          |

Na aplicação `MAT202`, estão autorizados `aluno@exemplo.com` e `beatriz@exemplo.com`. O código de verificação é exibido na interface, identifica expressamente uma demonstração e expira em dez minutos. Nenhum e-mail é enviado. Depois da verificação, o token local só permite iniciar uma participação na aplicação e com o e-mail correspondentes; ele é consumido ao iniciar.

As datas de exemplo são calculadas quando os dados são criados pela primeira vez naquele navegador. Depois disso, os períodos persistidos continuam avançando normalmente. Para recomeçar os exemplos, use um perfil novo do navegador ou limpe os dados deste site, incluindo localStorage e IndexedDB. Isso apaga avaliações, materiais, participações e correções locais.

## Funcionalidades

- **Visão geral:** indicadores derivados dos exemplos, aplicações recentes, próximas atividades e respostas aguardando correção.
- **Avaliações:** pesquisa, filtros, criação, edição, duplicação, arquivamento e associação de materiais. O editor permite adicionar, remover e reordenar questões de alternativa única, verdadeiro ou falso e resposta aberta, com pontuação e prévia para o aluno.
- **Materiais:** cadastro e consulta de links e arquivos locais. Os arquivos ficam no navegador, com visualização quando o formato permite; não são apresentados como enviados a um servidor.
- **Aplicações:** validação de período, duração, lista de e-mails e ambiente; geração de código e link, cópia do link e encerramento.
- **Resultados:** participações com identificador próprio, respostas, correção das questões abertas, feedback e controle de liberação. Questões objetivas são pontuadas automaticamente. Questões abertas sem resposta valem zero. Desistências preservam as respostas salvas para consulta, sem correção ou liberação de nota.
- **Conta:** perfil fictício e estado demonstrativo da assinatura.
- **Aluno:** acesso, identificação, instruções e materiais, preparação do ambiente, navegação pelas questões, rascunho local, sincronização simulada, revisão, entrega ou desistência e confirmação. Nota e feedback aparecem somente após a liberação pelo professor.

## Estrutura

```text
src/
  components/       Layouts, feedback, diálogos e editor de questões
  pages/            Páginas do professor e acesso público do aluno
  styles/           Estilos compartilhados e por área/componente
  types/            Modelos de domínio e tipos públicos
  data/seed.ts      Dados fictícios com calendário relativo
  services/
    demoApi.ts      Serviços assíncronos, regras e persistência local
    nativeApp.ts    Estados e autorização de retomada simulados
    useStudentAttempt.ts  Respostas, autosave e prazo na interface
    format.ts       Formatação em português do Brasil
tests/
  domain.test.ts    Regras de tempo, acesso, tentativas e resultados
  browser/          Percursos do professor e do aluno em Chromium
vite.config.ts     Configuração de desenvolvimento e build
vitest.config.ts   Configuração isolada dos testes de domínio
playwright.config.ts  Configuração dos percursos no navegador
```

A stack usa React, TypeScript, Vite, React Router, CSS e ícones Lucide. As versões instaláveis estão fixadas pelo `package-lock.json`.

Os modelos principais são `Teacher`, `Assessment`, `Question`, `Material`, `Application`, `Attempt` e `Answer`. A avaliação é reutilizável; cada aplicação publicada armazena uma cópia independente do conteúdo, das questões, dos gabaritos e das regras. Edições posteriores na avaliação não modificam aplicações existentes.

Os serviços oferecem métodos assíncronos por `demoApi` e por exports nomeados. `createDemoApi` aceita armazenamento e relógio substituíveis para testes. Erros incluem `code` e uma mensagem legível em português. Os métodos públicos devolvem modelos separados: sem gabaritos, lista de e-mails autorizados ou notas e feedback ainda não liberados.

## Persistência e regras das tentativas

Dados pequenos são armazenados em `avaliacoes-online.demo.v1` no localStorage. Arquivos ficam no banco IndexedDB `avaliacoes-online-materials-v1`, no armazenamento `files`. Os textos de apoio iniciais são arquivos de exemplo incluídos no código. URLs e metadados dos materiais permanecem nos dados pequenos.

O marcador da participação por aplicação usa `ao.student.attempt.<CODIGO>`. Cada rascunho local usa `ao.demo.draft.<ID>` e contém as respostas e o horário do salvamento. A interface distingue rascunho local, sincronização em andamento, sincronização concluída e falha. A falha simulada não elimina o rascunho.

Cada participação recebe um ID e um identificador próprios, mesmo quando os nomes são iguais. O prazo absoluto é o menor valor entre o fim da disponibilidade e o início somado à duração. Recarregar a página ou restabelecer a conexão não reinicia esse prazo.

Ao atingir o limite, o serviço encerra a participação com as respostas sincronizadas e com o último rascunho local válido salvo dentro do prazo. Rascunhos anteriores ao início, posteriores ao prazo ou inválidos são ignorados. Tentativas entregues, desistentes ou expiradas não voltam ao estado em andamento e suas respostas finais não são alteradas. Encerrar uma aplicação impede novas participações e encerra as participações ainda abertas.

O estado da participação, o estado da correção e a liberação do resultado são campos separados. Uma correção pendente impede a liberação. Reabrir a confirmação permite consultar o resultado quando ele for liberado.

## Cenários de verificação

1. **Percurso completo:** entre no painel, crie uma avaliação com uma questão objetiva e uma aberta, publique em Aplicações com início atual e fim futuro, copie o link, participe como aluno e entregue. Em Resultados, abra a participação, atribua a nota aberta, salve a correção e libere o resultado. Volte à confirmação do aluno e atualize a consulta.
2. **Recarga:** responda uma questão em `BIO101`, aguarde a sincronização e recarregue. As respostas e o prazo original devem ser retomados.
3. **Nomes iguais:** inicie duas participações com o mesmo nome em sessões públicas independentes do mesmo navegador. Elas devem ter identificadores próprios e não sobrescrever respostas. Para iniciar outra participação após a confirmação, use a ação de nova participação da demonstração.
4. **Prazo:** publique uma aplicação com duração de um minuto, salve uma resposta e aguarde o término. A confirmação deve indicar tempo esgotado; recarregar mantém o encerramento. Se a disponibilidade terminar antes da duração, prevalece o fim da disponibilidade.
5. **E-mail:** em `MAT202`, tente um endereço fora da lista e confirme a recusa. Use `aluno@exemplo.com`, solicite o código demonstrativo, tente um código incorreto e depois o correto.
6. **Aplicativo:** em `FIS303`, selecione verificação pendente, não instalado ou incompatível e confirme que não é possível começar. Selecione Pronto, comece, responda e simule conexão interrompida. A interação deve ficar suspensa; as respostas e o prazo são preservados. Selecione Pronto e solicite a retomada.
7. **Salvamento:** ative a falha de sincronização no controle demonstrativo da prova e responda. A interface deve informar a falha mantendo o rascunho local. Desative o cenário e tente sincronizar novamente. A entrega requer a sincronização; o prazo continua correndo durante a falha.
8. **Estados de acesso:** abra um código inexistente, `GEO404` e `HIS505` para verificar link inválido, abertura futura e encerramento.
9. **Cópia publicada:** publique uma avaliação, altere o enunciado ou gabarito no editor e confira que a aplicação publicada mantém o conteúdo original.

Os testes automatizados cobrem IDs distintos inclusive em chamadas simultâneas, recarga e prazo absoluto, respostas finais imutáveis, expiração com rascunho local após falha, validações de disponibilidade e configuração, e-mail e token inválidos, cópias publicadas, retorno público, correção/liberação e aplicativo indisponível.

Os testes de navegador verificam as mensagens de acesso, identificação por e-mail, novas participações explícitas com nomes iguais, recarga de respostas e prazo, recuperação de rascunho após falha de sincronização, suspensão e retomada do aplicativo e confirmação após tempo esgotado. O cenário de expiração encurta somente o prazo de um dado local de teste para evitar aguardar os 45 minutos da atividade; a derivação do prazo é coberta nos testes de domínio.

## Integrações futuras e limites

Esta implementação demonstra os fluxos no navegador. localStorage, IndexedDB, códigos, tokens, dados e relógio podem ser consultados ou alterados pelo próprio usuário. A separação dos modelos públicos evita exposição acidental na interface, mas os mocks contêm os dados internos no mesmo navegador e não oferecem segurança de produção. Os dados não são compartilhados entre dispositivos ou perfis, não há recuperação remota de arquivos e limpar o armazenamento remove a demonstração.

Uma API real deverá validar identidade, sessão, permissões do professor e do aluno, e-mails autorizados, prazo e estados definitivos. Também deverá enviar e-mails, armazenar arquivos com validação e controle de acesso, persistir tentativas e correções, tratar concorrência e falhas de rede e servir somente os dados públicos autorizados. Assinatura e pagamentos dependerão de uma integração própria.

A integração com o aplicativo é claramente simulada nos estados Verificação pendente, Não instalado, Incompatível, Pronto e Conexão interrompida. A regra de autorização de início/retomada fica em `nativeApp.ts`, para substituição futura. Windows 11 e Linux Mint são sistemas previstos; não há compatibilidade já validada nem download disponível.

O aplicativo futuro será responsável pelas restrições ao ambiente da prova. A instalação poderá exigir administrador, e o professor não deverá configurar políticas manualmente. O front-end atual não bloqueia o computador, não captura globalmente teclado ou mouse e não afirma que o computador está protegido. Tela cheia ou detecção de foco não implementam esse controle. A integração nativa, a autorização do backend e a validação nos sistemas previstos são etapas futuras.
