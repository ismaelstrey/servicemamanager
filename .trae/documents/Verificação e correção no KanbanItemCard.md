## Verificação
- Chequei diagnósticos do arquivo e não há erros de TypeScript ou sintaxe reportados.
- Possível alerta de lint: função `getPriorityVariant` não é mais utilizada após troca para ícone de prioridade.

## Correções propostas
1. Remover `getPriorityVariant` para evitar warning de variável não utilizada.
2. Ajustar `TopRow` para garantir espaçamento consistente ao usar apenas o ícone (sem badge), mantendo minimalismo.
3. Manter todo o restante (tooltip em portal, iniciais no rodapé, ícone de prioridade) como está.

## Verificação pós-correção
- Rodar lint e build para garantir zero erros no arquivo.
- Validar visual e interação (hover/drag) no Kanban.

Posso aplicar essas correções?