## Objetivo
- Em `/providers/:id`, exibir todas as informações retornadas pela API de provedor: `name`, `workspace`, `cnpj`, `email`, `phone`, `website`, `description`, `logo`, `plan`, `status`, `address`, `contactInfo`, `settings`, `createdAt`, `updatedAt`.

## Alterações de Código
- Tipos:
  - Expandir `interface ProviderDetails` em `frontend/src/pages/providers/ProviderDetailsPage.tsx` para incluir:
    - `phone?: string`, `website?: string`, `description?: string`, `logo?: string`
    - `address?: { id?: number; street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; zipCode?: string; country?: string }`
    - `contactInfo?: { primaryPhone?: string; email?: string; website?: string }`
    - `settings?: { timezone?: string; language?: string; dateFormat?: string; timeFormat?: string; currency?: string; ticketSettings?: any; notificationSettings?: any; securitySettings?: any; integrationSettings?: any }`
- Carregamento:
  - Manter `loadProvider` como está (já usa `ApiService.get('/providers/:id')` e extrai `res.data.data`).
- UI/Layout:
  - Reorganizar o conteúdo em seções utilizando `Card` e `styled-components`, seguindo o padrão já usado na página:
    - "Visão Geral": logo (se `logo`), título, `plan` e `status` (badges), `workspace`.
    - "Informações": `email`, `phone`, `website`, `cnpj`, `description`.
    - "Endereço": todos os campos de `address` (exibir `'-'` quando vazio).
    - "Contato": `contactInfo.primaryPhone`, `contactInfo.email`, `contactInfo.website`.
    - "Configurações": `timezone`, `language`, `dateFormat`, `timeFormat`, `currency` e presença de blocos `ticketSettings`, `notificationSettings`, `securitySettings`, `integrationSettings` (mostrar como texto simples ou indicar "configurado"/"não configurado").
    - Datas: `createdAt` e `updatedAt` formatadas.
  - Manter seção de "Estatísticas" e "Ações" já existentes.
- Estilo/Componentes:
  - Reutilizar `Card`, `Badge`, `Button`, `Spinner`, `Alert` e os estilos da página.
  - Não adicionar dependências novas.

## Validação
- Typecheck: `npx tsc -b --noEmit` no frontend.
- Verificação manual navegando até `/providers/4` e conferindo preenchimento das seções.

## Observações
- Renderizar com segurança usando encadeamento opcional (`provider?.address?.city ?? '-'`).
- Não alterar contrato da API; somente leitura e exibição.

Confirma que posso aplicar essas mudanças?