import { useCallback, useEffect, useMemo, useState } from 'react';
import ClientAuthService from '../services/clientAuthService';
import ClientProfileService from '../services/clientProfileService';
import { useClientAuth } from './useClientAuth';
import { useThemeMode } from '../contexts/ThemeModeContext';
import type { ClientUser } from '../types/client';

// Hook para gerenciar carregamento e atualização de perfil do cliente
// Inclui integração com preferências de tema e persistência local para notificações/privacidade
export interface UseProfileReturn {
  profile: ClientUser | null;
  loading: boolean;
  error: string | null;
  // Atualiza campos básicos do perfil
  saveProfile: (data: Partial<ClientUser> & { phone?: string; document?: string; address?: any; avatar?: string }) => Promise<void>;
  // Preferências de tema (usa ThemeModeContext)
  theme: 'light' | 'dark' | 'system';
  setThemePreference: (value: 'light' | 'dark' | 'system') => void;
  // Configurações de notificações (persistidas localmente por enquanto)
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  setNotifications: (value: { email: boolean; push: boolean; desktop: boolean }) => void;
  // Configurações de privacidade (persistidas localmente por enquanto)
  privacy: {
    profileVisibility: 'public' | 'private' | 'team_only';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    shareActivityStatus: boolean;
  };
  setPrivacy: (value: {
    profileVisibility: 'public' | 'private' | 'team_only';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    shareActivityStatus: boolean;
  }) => void;
}

const NOTIFICATION_KEY = 'clientNotificationSettings';
const PRIVACY_KEY = 'clientPrivacySettings';

export function useProfile(): UseProfileReturn {
  const { user, updateUser } = useClientAuth();
  const { mode, setMode } = useThemeMode();

  const [profile, setProfile] = useState<ClientUser | null>(user);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotificationsState] = useState<{ email: boolean; push: boolean; desktop: boolean }>(() => {
    try {
      const raw = localStorage.getItem(NOTIFICATION_KEY);
      return raw ? JSON.parse(raw) : { email: true, push: false, desktop: false };
    } catch {
      return { email: true, push: false, desktop: false };
    }
  });

  const [privacy, setPrivacyState] = useState<{
    profileVisibility: 'public' | 'private' | 'team_only';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    shareActivityStatus: boolean;
  }>(() => {
    try {
      const raw = localStorage.getItem(PRIVACY_KEY);
      return raw
        ? JSON.parse(raw)
        : {
          profileVisibility: 'private',
          showOnlineStatus: true,
          allowDirectMessages: true,
          shareActivityStatus: false,
        };
    } catch {
      return {
        profileVisibility: 'private',
        showOnlineStatus: true,
        allowDirectMessages: true,
        shareActivityStatus: false,
      };
    }
  });

  // Carrega perfil do cliente autenticado
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const current = await ClientAuthService.getProfile();
        if (mounted) {
          setProfile(current);
          updateUser(current);
        }
      } catch (err: any) {
        if (mounted) {
          const msg = err?.response?.data?.message || 'Erro ao carregar perfil';
          setError(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva perfil no backend e atualiza contexto/local
  const saveProfile = useCallback(
    async (data: Partial<ClientUser> & { phone?: string; document?: string; address?: any; avatar?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await ClientProfileService.updateProfile(data);
        setProfile(updated);
        updateUser(updated);
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao atualizar perfil';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [updateUser]
  );

  // Persistência local das seções Notificações e Privacidade
  const setNotifications = useCallback((value: { email: boolean; push: boolean; desktop: boolean }) => {
    setNotificationsState(value);
    try {
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, []);

  const setPrivacy = useCallback(
    (value: {
      profileVisibility: 'public' | 'private' | 'team_only';
      showOnlineStatus: boolean;
      allowDirectMessages: boolean;
      shareActivityStatus: boolean;
    }) => {
      setPrivacyState(value);
      try {
        localStorage.setItem(PRIVACY_KEY, JSON.stringify(value));
      } catch {
        // ignore
      }
    },
    []
  );

  // Preferência de tema usando ThemeModeContext
  const theme = useMemo(() => mode, [mode]);
  const setThemePreference = useCallback(
    (value: 'light' | 'dark' | 'system') => {
      setMode(value);
    },
    [setMode]
  );

  return {
    profile,
    loading,
    error,
    saveProfile,
    theme,
    setThemePreference,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
  };
}

export default useProfile;