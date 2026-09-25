# Workout MVP Specification

## Problem Statement

Quem treina na academia anota séries, repetições e carga em papel ou em apps que não conhecem o modelo semanal da pessoa. Sem esse registro estruturado, não dá para saber o que foi feito em cada dia nem, numa versão seguinte, quanto cada músculo foi recrutado. A primeira versão entrega o ciclo completo de entrar, montar o modelo, treinar e guardar o que aconteceu, no aparelho e no servidor.

## Goals

- [ ] Um usuário autenticado monta um modelo semanal, associa exercícios do catálogo a cada dia e conclui uma sessão registrando kg e repetições por série.
- [ ] O registro sobrevive sem rede e chega ao Supabase quando a rede volta, sem duplicar a série já concluída.
- [ ] Cada exercício do catálogo guarda a ênfase (1 a 5) dos músculos agonistas e sinergistas, pronta para o dashboard de uma versão futura.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Dashboard, gráficos e volume semanal na tela | Segunda versão. A v1 só grava a ênfase muscular para esse cálculo existir depois. |
| Painel admin que cria treino e atribui a um usuário | Futuro. Na v1 o treino é criado pelo próprio usuário. |
| Exercício criado pelo usuário | O catálogo da v1 é a lista pronta do app. |
| Plano de treino prescrito por outra pessoa | Mesmo motivo do admin. |
| RPE, tempo sob tensão e outras métricas de esforço da sessão | Esforço da sessão na v1 é kg, repetições e séries. Ênfase 1–5 é propriedade do exercício, não da sessão. |
| Vários modelos ativos ao mesmo tempo | Um modelo ativo por usuário. |
| Unidades além de kg | Carga é sempre em quilogramas. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Servidor | Supabase (Postgres + Auth) | O domínio é relacional (exercício, músculo, dia, série). Firestore desmontaria essas relações. | y |
| Persistência local | SQLite no aparelho, sync quando houver rede | Supabase não é o banco offline. O treino não pode depender de rede no meio da série. | y |
| Login | Google OAuth e e-mail com senha | Os dois caminhos foram pedidos para a tela de login. | y |
| Ênfase muscular | Inteiro de 1 a 5 | 1–3 junta músculos diferentes; 1–10 finge precisão que o catálogo não tem. | y |
| Treino do dia | Calendário fixo do modelo | Faltar um dia não empurra a letra. A pessoa troca o treino na hora se quiser. | y |
| Catálogo | Lista pronta, só seleção | Criar exercício próprio ficou fora da v1. | y |
| Prescrição do dia | Só o número de séries planejadas | Repetições e kg são o que aconteceu na série. | y |
| Descanso | Padrão inicial de 90 segundos, sem teto; o usuário troca o padrão e também o intervalo da vez | 90s cobre a maioria. Não há limite máximo. Cada descanso usa o padrão salvo, e a troca na hora não altera esse padrão. Duração menor que 1 segundo é recusada. | y |
| Modelo ativo | Um por usuário | A tela inicial precisa de um único candidato a "treino de hoje". | y |
| Conflito de sync | O registro local da série concluída vence | A série feita na academia é o fato. Reenviar não cria segunda cópia. | y |
| Expiração de dados | Não expira na v1 | Histórico de treino é o produto. Apagar ou arquivar fica fora. | y |
| Observabilidade de produto | Sem métricas de uso na v1 | Não há requisito de analytics. Log técnico de falha de sync basta. | y |
| Sessão simultânea | Uma sessão em andamento por usuário | Dois treinos abertos ao mesmo tempo tornariam "concluir o treino" ambíguo. | y |

**Open questions:** none - all resolved or logged above.

### Dimensões implícitas

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | WORK-08, WORK-09 |
| Failure / partial-failure | WORK-15 |
| Idempotency / retry | WORK-16 |
| Auth boundaries | WORK-02, WORK-03 |
| Concurrency / ordering | WORK-14 |
| Data lifecycle / expiry | N/A because o histórico não expira na v1 |
| Observability | N/A because não há requisito de métricas de produto na v1 |
| External-dependency failure | WORK-15 |
| State-transition integrity | WORK-12, WORK-13, WORK-14 |

---

## User Stories

### P1: Entrar na conta ⭐ MVP

**User Story**: Como praticante, quero entrar com Google ou com e-mail e senha para que meus treinos fiquem na minha conta.

**Why P1**: Sem identidade não há sync nem treino atribuído a alguém.

**Acceptance Criteria**:

1. WHEN o usuário conclui o login com Google THEN the system SHALL abrir a área autenticada com a sessão desse usuário.
2. WHEN o usuário registra e-mail e senha válidos e entra THEN the system SHALL abrir a área autenticada com a sessão desse usuário.
3. IF o e-mail ou a senha estão errados THEN the system SHALL permanecer na tela de login e mostrar que a entrada falhou.
4. WHILE não há sessão autenticada the system SHALL mostrar apenas a tela de login.

**Independent Test**: Entrar com e-mail e senha de teste e ver a tela inicial. Tentar a senha errada e continuar na tela de login.

---

### P1: Catálogo de exercícios ⭐ MVP

**User Story**: Como praticante, quero escolher exercícios de uma lista pronta, cada um com músculos e ênfase, para montar o dia de treino sem cadastrar o movimento.

**Why P1**: O modelo semanal e a sessão só existem em cima dessa lista. A ênfase é o que o dashboard futuro vai ler.

**Acceptance Criteria**:

1. The system SHALL oferecer um catálogo inicial com nome do exercício e, para cada músculo agonista ou sinergista, um inteiro de ênfase de 1 a 5.
2. WHEN o usuário busca ou percorre o catálogo THEN the system SHALL listar somente exercícios desse catálogo.
3. The supino reto SHALL incluir peito com ênfase 5, tríceps com ênfase 3 e ombro com ênfase 4.

**Independent Test**: Abrir a lista, encontrar o supino reto e ver peito 5, tríceps 3 e ombro 4.

---

### P1: Montar o modelo semanal ⭐ MVP

**User Story**: Como praticante, quero escolher um modelo semanal e preencher os exercícios de cada dia para que o app saiba o que sugerir e o que executar.

**Why P1**: Sem modelo não há "treino do dia" nem tela de treino.

**Acceptance Criteria**:

1. WHEN o usuário abre o cadastro de modelo THEN the system SHALL listar pelo menos ABC, ABCDE, ABC 2x, PPL e full body.
2. WHEN o usuário escolhe ABC 2x THEN the system SHALL mostrar seis dias: A1, B1, C1, A2, B2 e C2.
3. WHEN o usuário adiciona um exercício do catálogo a um dia e informa as séries planejadas THEN the system SHALL gravar esse exercício nesse dia com esse número de séries.
4. WHEN o usuário conclui o registro do modelo THEN the system SHALL marcar esse modelo como o único ativo da conta.
5. IF o usuário tenta concluir um modelo com algum dia sem exercício THEN the system SHALL recusar a conclusão e indicar o dia incompleto.
6. WHEN não existe modelo ativo THEN the system SHALL oferecer na tela inicial o caminho para criar um modelo, e nenhum treino do dia.

**Independent Test**: Escolher ABC 2x, pôr um exercício em cada um dos seis dias, concluir, e ver o modelo ativo na tela inicial.

---

### P1: Treinar no dia ⭐ MVP

**User Story**: Como praticante, quero ver o treino mais provável de hoje, poder trocar, e registrar cada série com carga, repetições e descanso para que a sessão fique salva.

**Why P1**: É o uso diário do app. O resto existe para chegar aqui.

**Acceptance Criteria**:

1. WHEN existe um modelo ativo THEN the system SHALL sugerir o dia fixo daquele weekday: ABCDE mapeia segunda A, terça B, quarta C, quinta D, sexta E; full body 3x mapeia segunda, quarta e sexta; sábado e domingo não sugerem treino.
2. WHEN o usuário escolhe outro dia do modelo THEN the system SHALL abrir a sessão com os exercícios desse dia, sem alterar o mapa do calendário.
3. WHEN o usuário abre um exercício da sessão THEN the system SHALL mostrar a quantidade de séries planejadas.
4. WHEN o usuário inicia uma série e a conclui informando kg e repetições THEN the system SHALL gravar kg, repetições e a duração entre iniciar e concluir.
5. WHEN o usuário conclui uma série e ainda há série seguinte THEN the system SHALL iniciar o descanso com a duração padrão salva na conta (90 segundos até o usuário trocar) e SHALL oferecer pular.
6. WHEN o usuário define uma nova duração padrão em segundos inteiros, de 1 segundo em diante, THEN the system SHALL gravar essa duração e usá-la no próximo descanso.
7. IF o usuário informa uma duração padrão menor que 1 segundo THEN the system SHALL recusar e manter a duração padrão anterior.
8. WHILE um descanso está em andamento, WHEN o usuário escolhe outra duração THEN the system SHALL reiniciar esse descanso com a nova duração e SHALL manter a duração padrão salva.
9. WHEN o usuário pede uma série além das planejadas THEN the system SHALL acrescentar essa série à sessão e aceitar kg e repetições.
10. WHEN o usuário encerra o exercício antes de completar as séries planejadas THEN the system SHALL manter as séries já concluídas e seguir para o próximo exercício.
11. WHEN o usuário conclui o treino THEN the system SHALL fechar a sessão com as séries concluídas até aquele momento.
12. IF o usuário informa kg menor ou igual a zero, ou repetições menores que 1 THEN the system SHALL recusar a série e pedir os dois valores de novo.
13. WHILE uma sessão está em andamento the system SHALL impedir abrir uma segunda sessão.
14. IF o Supabase está inacessível WHEN o usuário conclui uma série THEN the system SHALL gravar a série no aparelho e sincronizar depois, sem criar uma segunda cópia da mesma série.

**Independent Test**: Com um modelo ABCDE ativo, numa segunda-feira, ver o treino A sugerido, trocar para B, concluir uma série com kg e reps, trocar o descanso da vez para um valor diferente do padrão, gravar um padrão novo e ver o descanso seguinte usar esse padrão. Encerrar o exercício cedo e concluir o treino. Os registros permanecem após fechar e reabrir o app sem rede.

---

## Edge Cases

- IF o weekday não tem dia mapeado (sábado e domingo no ABCDE e no full body 3x) THEN the system SHALL informar que não há treino sugerido e permitir escolher qualquer dia do modelo.
- IF o usuário mata o app no meio da série iniciada e ainda não concluída THEN the system SHALL descartar essa série incompleta e manter as séries já concluídas.
- IF o mesmo registro local é enviado duas vezes THEN the system SHALL persistir uma única série concluída.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| WORK-01 | P1: Entrar na conta | Tasks | T13, T15 |
| WORK-02 | P1: Entrar na conta | Tasks | T13, T14, T15 |
| WORK-03 | P1: Entrar na conta | Tasks | T13, T14, T15 |
| WORK-04 | P1: Catálogo de exercícios | Tasks | T5 |
| WORK-05 | P1: Catálogo de exercícios | Tasks | T5, T19 |
| WORK-06 | P1: Montar o modelo semanal | Tasks | T6, T17, T18 |
| WORK-07 | P1: Montar o modelo semanal | Tasks | T6, T18 |
| WORK-08 | P1: Montar o modelo semanal | Tasks | T8, T19 |
| WORK-09 | P1: Treinar no dia | Tasks | T11, T22 |
| WORK-10 | P1: Treinar no dia | Tasks | T10, T17 |
| WORK-11 | P1: Treinar no dia | Tasks | T17, T22 |
| WORK-12 | P1: Treinar no dia | Tasks | T11, T22 |
| WORK-13 | P1: Treinar no dia | Tasks | T10, T21 |
| WORK-14 | P1: Treinar no dia | Tasks | T10, T16 |
| WORK-15 | P1: Treinar no dia | Tasks | T12 |
| WORK-16 | P1: Treinar no dia | Tasks | T12 |
| WORK-17 | P1: Treinar no dia | Tasks | T9, T22 |
| WORK-18 | P1: Treinar no dia | Tasks | T10, T21 |

**Coverage:** 18 total, 18 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [ ] Um usuário novo entra, cria um modelo, preenche os dias e conclui uma sessão com pelo menos uma série (kg e repetições) sem usar dashboard.
- [ ] Com rede cortada no meio da sessão, a série concluída continua no aparelho e, com a rede de volta, existe uma vez só no Supabase.
- [ ] O supino reto do catálogo expõe peito 5, tríceps 3 e ombro 4.
