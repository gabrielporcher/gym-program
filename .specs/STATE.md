# STATE

## Decisions

### AD-001
- **Decision**: A tela lê e grava no SQLite do aparelho; uma fila faz upsert no Supabase. Auth e cópia de servidor são Supabase, não Firebase nem WatermelonDB.
- **Reason**: O treino precisa completar uma série sem rede, e o domínio é relacional. A regra de conflito é "a série concluída no aparelho vence", então um motor de sync maior não se paga.
- **Trade-off**: O sync (fila, upsert, RLS) é código nosso. Vários aparelhos editando a mesma sessão ao mesmo tempo não são um caso desta versão.
- **Scope**: Todo dado de produto do app, a partir de workout-mvp.
- **Date**: 2026-09-24
- **Status**: active

### AD-002
- **Decision**: Telas em `src/app/`, primitivos em `src/components/ui/`, lógica em poucos arquivos `src/lib/`. A interface é a mesma no Android e no iOS, com os tokens de `src/constants/theme.ts` (primary `#2C7A7F`, accent `#4FD1C5`, ink `#2C3E50`, surface `#E6FFFA`, danger `#FF3B30`).
- **Reason**: O app precisa parecer um produto só, com cara de interface iOS, sem ramificar componente nativo por sistema. A paleta e a escala de espaço evitam cada tela inventar margem e raio.
- **Trade-off**: Não usamos os controles nativos do `@expo/ui` nem um visual Material no Android. Menos aparência de sistema, mais consistência.
- **Scope**: Toda tela e componente de produto, a partir de workout-mvp.
- **Date**: 2026-09-24
- **Status**: active

## Handoff

- **Feature**: workout-mvp
- **Phase / task**: Phase 2 complete through T7. Next is Phase 3, T8.
- **Completed**: T1 `386b5df`, T2 `a202106`, T3 `5fc799b`, T4 `014fa9b`, T5 `958a2b0`, T6 `fbfb85e`, T7 `b0a79b1`
- **In progress**: none
- **Next step**: T8, save the active program in `src/lib/workout.ts`
- **Blockers**: none. `bun` is not on PATH; gates ran with `npm run lint`, `npx tsc --noEmit`, and `npx jest`.
- **Uncommitted**: this handoff. Spec and design were already untracked and were not part of these commits.
- **Branch**: main
