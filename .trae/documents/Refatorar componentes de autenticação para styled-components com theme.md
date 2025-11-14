## Objetivo
Atualizar todos os componentes em `frontend/src/components/auth/` para usar styled-components com tokens do theme, removendo classes e estilos inline, padronizando layout e acessibilidade.

## Escopo de arquivos
- `LoginForm.tsx`: já usa styled-components; apenas garantir consistência (sem estilos inline).
- `RegisterForm.tsx`: mover styled-components para fora da função, padronizar cores da barra/label de força da senha com o theme.
- `ForgotPasswordForm.tsx`: já usa styled-components; revisar pequenas consistências.
- `ResetPasswordForm.tsx`: mover styled-components para fora da função, padronizar cores da barra/label de força da senha com o theme.
- `ProtectedRoute.tsx`: substituir blocos com `className` por styled-components (Wrapper, Content, Icon, Info, Title, Description) usando theme.
- `ClientProtectedRoute.tsx` / `ClientPublicRoute.tsx`: não possuem UI visível além de `Navigate`; manter simples (sem necessidade de styled), mas garantir que mensagens/estruturas futuras usem o theme.

## Implementação técnica
1. **Eliminar classes e estilos inline**
   - Remover `className="access-denied"` e derivados em `ProtectedRoute.tsx` e criar wrappers estilizados com theme (espaçamentos, bordas, cores, sombras).
   - Substituir `<span style={{ color: ... }}>` por componentes styled (`StrengthLabel`) em `RegisterForm.tsx` e `ResetPasswordForm.tsx`.

2. **Mover styled-components para escopo superior**
   - Em `RegisterForm.tsx` e `ResetPasswordForm.tsx`, declarar `Wrapper`, `Header`, `Title`, `Description`, `Form`, `StrengthBar`, `Bar`, `Fill`, `Row/Actions` fora da função para evitar recriação por render.

3. **Mapeamento de cores pelo theme**
   - Criar util local `getStrengthThemeColor(score, theme)` para retornar `theme.colors.danger.main` (fraca), `theme.colors.warning.main` (média), `theme.colors.success.main` (forte).
   - Usar o mesmo mapeamento para a barra (`Fill`) e para o label (`StrengthLabel`).

4. **Acessibilidade e semântica**
   - Em `ProtectedRoute.tsx`, títulos com `<h2>` e descrições com `<p>`, adicionar `role="alert"` quando apropriado.
   - Manter navegação com `Button` (já estilizado) para ações como “Voltar”.

5. **Consistência de layout**
   - Espaçamentos: usar `theme.spacing.xs/sm/md/lg`.
   - Cores de texto: `theme.colors.text.primary/secondary`.
   - Contêineres: quando fizer sentido, usar `Card` para o bloco de “Acesso Negado” com `padding` e `borderRadius` do theme.

## Resultados esperados
- Todos os componentes de auth sem classes CSS manuais ou estilos inline.
- UI alinhada visualmente e consistente com o theme da aplicação.
- Melhora de performance (styled-components fora do escopo da função). 

## Validação
- Rodar build e abrir páginas: login, registro, esqueci senha, reset, rotas protegidas.
- Verificar alinhamento, cores e ícones conforme theme; testar fluxo de mostrar/ocultar senha.

## Confirmação
Você confirma que eu prossiga com essas alterações nos arquivos acima? Posso iniciar a refatoração agora.