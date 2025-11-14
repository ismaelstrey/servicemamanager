import { useQuery } from '@tanstack/react-query'
import ProviderService, { type ProviderListItem } from '../services/providerService'

export function useProviders(limit: number = 50) {
  return useQuery<ProviderListItem[]>({
    queryKey: ['providers', { limit }],
    queryFn: () => ProviderService.listProviders({ limit }),
    staleTime: 5 * 60 * 1000,
  })
}

export default useProviders