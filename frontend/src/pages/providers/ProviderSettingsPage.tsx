import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardBody, CardFooter, Button, Input,  Switch, Checkbox, Spinner, Alert, Divider, Heading } from '../../components/ui';
import { ApiService } from '../../services/api';
import { ProviderService } from '../../services/providerService';

interface ProviderResponse {
  id: number;
  name: string;
  workspace: string;
  email?: string;
  settings?: ProviderSettings;
}

// Subconjunto dos campos de ProviderSettings usados na tela
interface ProviderSettings {
  timezone?: string;
  notificationSettings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    webhookUrl?: string;
  };
  securitySettings?: {
    requireTwoFactor?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    };
  };
  integrationSettings?: {
    zabbixEnabled?: boolean;
    apiEnabled?: boolean;
    webhooksEnabled?: boolean;
    allowedOrigins?: string[];
    rateLimiting?: {
      enabled?: boolean;
      requestsPerMinute?: number;
    };
  };
}

const ProviderSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [info, setInfo] = useState<{ name?: string; email?: string; phone?: string; website?: string; cnpj?: string; description?: string; logo?: string }>({});
  const [settings, setSettings] = useState<ProviderSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
      const res = await ApiService.get<any>(`/providers/${id}`);
      const data: ProviderResponse | null = res?.data?.data ?? res?.data ?? null;
      setProvider(data);
      setSettings(data?.settings ?? {});
      const anyData = data as any;
      setInfo({
        name: data?.name ?? '',
        email: data?.email ?? '',
        phone: anyData?.phone ?? '',
        website: anyData?.website ?? '',
        cnpj: anyData?.cnpj ?? '',
        description: anyData?.description ?? '',
        logo: anyData?.logo ?? ''
      });
      } catch (err: any) {
        setError(err?.message ?? 'Falha ao carregar configurações do provedor');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Helpers de update imutável
  const updateSettings = (path: (keyof ProviderSettings) | string, value: any) => {
    setSettings(prev => {
      const next = { ...prev } as any;
      const segments = String(path).split('.');
      let cursor = next;
      for (let i = 0; i < segments.length - 1; i++) {
        const s = segments[i];
        cursor[s] = cursor[s] ?? {};
        cursor = cursor[s];
      }
      cursor[segments[segments.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload: ProviderSettings = settings;
      const updated = await ProviderService.updateSettings(Number(id), payload);
      // A API retorna o provider atualizado; sincronizar estado
      const updatedProvider: ProviderResponse = (updated?.data ?? updated);
      setProvider(updatedProvider);
      setSettings(updatedProvider?.settings ?? payload);
      setSuccess('Configurações salvas com sucesso');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = { ...info };
      const updated = await ProviderService.update(Number(id), payload);
      const updatedProvider: ProviderResponse = (updated?.data ?? updated);
      setProvider(updatedProvider);
      setSuccess('Provedor atualizado com sucesso');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao atualizar provedor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Header>
        <Title>
          {`Configurações do Provedor${provider?.name ? ` — ${provider.name}` : ''}${provider?.workspace ? ` (${provider.workspace})` : ''}`}
        </Title>
        <Actions>
          <Button onClick={() => navigate(`/providers/${id}`)}>Voltar</Button>
          <Button onClick={handleSave} disabled={saving} loading={saving}>Salvar</Button>
        </Actions>
      </Header>

      <AnimatePresence>{error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Alert variant="error" title="Erro">{error}</Alert>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Alert variant="success" title="Sucesso">{success}</Alert>
        </motion.div>
      )}</AnimatePresence>

      {loading ? (
        <Centered>
          <Spinner size="md" label="Carregando configurações..." />
        </Centered>
      ) : (
        <Content>
          <Card>
            <CardHeader>
              <Heading level={3}>Geral</Heading>
            </CardHeader>
            <CardBody>
              <Grid>
                <Input
                  label="Timezone"
                  placeholder="Ex.: America/Sao_Paulo"
                  value={settings.timezone ?? ''}
                  onChange={(e) => updateSettings('timezone', e.target.value)}
                  fullWidth
                />
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Dados do Provedor</Heading>
            </CardHeader>
            <CardBody>
              <Grid>
                <Input label="Nome" value={info.name ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, name: e.target.value }))} fullWidth />
                <Input type="email" label="E-mail" value={info.email ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))} fullWidth />
                <Input label="Telefone" value={info.phone ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, phone: e.target.value }))} fullWidth />
                <Input label="Website" value={info.website ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, website: e.target.value }))} fullWidth />
                <Input label="CNPJ" value={info.cnpj ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, cnpj: e.target.value }))} fullWidth />
                <Input label="Descrição" value={info.description ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, description: e.target.value }))} fullWidth />
                <Input label="Logo (URL)" value={info.logo ?? ''} onChange={(e) => setInfo(prev => ({ ...prev, logo: e.target.value }))} fullWidth />
              </Grid>
            </CardBody>
            <CardFooter>
              <Button onClick={handleSaveProvider} disabled={saving} loading={saving}>Salvar Dados do Provedor</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Notificações</Heading>
            </CardHeader>
            <CardBody>
              <Grid>
                <Switch
                  checked={!!settings.notificationSettings?.emailNotifications}
                  onChange={(e) => updateSettings('notificationSettings.emailNotifications', e.target.checked)}
                  label="E-mails"
                />
                <Switch
                  checked={!!settings.notificationSettings?.smsNotifications}
                  onChange={(e) => updateSettings('notificationSettings.smsNotifications', e.target.checked)}
                  label="SMS"
                />
                <Switch
                  checked={!!settings.notificationSettings?.pushNotifications}
                  onChange={(e) => updateSettings('notificationSettings.pushNotifications', e.target.checked)}
                  label="Push"
                />
                <Input
                  label="Webhook URL"
                  placeholder="https://seu-endpoint.com/webhook"
                  value={settings.notificationSettings?.webhookUrl ?? ''}
                  onChange={(e) => updateSettings('notificationSettings.webhookUrl', e.target.value)}
                  fullWidth
                />
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Segurança</Heading>
            </CardHeader>
            <CardBody>
              <Grid>
                <Switch
                  checked={!!settings.securitySettings?.requireTwoFactor}
                  onChange={(e) => updateSettings('securitySettings.requireTwoFactor', e.target.checked)}
                  label="Requer 2FA"
                />
                <Input
                  type="number"
                  label="Tempo de sessão (minutos)"
                  value={settings.securitySettings?.sessionTimeout ?? 480}
                  onChange={(e) => updateSettings('securitySettings.sessionTimeout', Number(e.target.value))}
                />
                <Divider />
                <Heading level={4}>Política de senha</Heading>
                <Input
                  type="number"
                  label="Tamanho mínimo"
                  value={settings.securitySettings?.passwordPolicy?.minLength ?? 8}
                  onChange={(e) => updateSettings('securitySettings.passwordPolicy.minLength', Number(e.target.value))}
                />
                <Checkbox
                  checked={!!settings.securitySettings?.passwordPolicy?.requireUppercase}
                  onChange={(e) => updateSettings('securitySettings.passwordPolicy.requireUppercase', e.currentTarget.checked)}
                  label="Requer maiúsculas"
                />
                <Checkbox
                  checked={!!settings.securitySettings?.passwordPolicy?.requireLowercase}
                  onChange={(e) => updateSettings('securitySettings.passwordPolicy.requireLowercase', e.currentTarget.checked)}
                  label="Requer minúsculas"
                />
                <Checkbox
                  checked={!!settings.securitySettings?.passwordPolicy?.requireNumbers}
                  onChange={(e) => updateSettings('securitySettings.passwordPolicy.requireNumbers', e.currentTarget.checked)}
                  label="Requer números"
                />
                <Checkbox
                  checked={!!settings.securitySettings?.passwordPolicy?.requireSymbols}
                  onChange={(e) => updateSettings('securitySettings.passwordPolicy.requireSymbols', e.currentTarget.checked)}
                  label="Requer símbolos"
                />
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Integrações</Heading>
            </CardHeader>
            <CardBody>
              <Grid>
                <Switch
                  checked={!!settings.integrationSettings?.zabbixEnabled}
                  onChange={(e) => updateSettings('integrationSettings.zabbixEnabled', e.target.checked)}
                  label="Zabbix"
                />
                <Switch
                  checked={!!settings.integrationSettings?.apiEnabled}
                  onChange={(e) => updateSettings('integrationSettings.apiEnabled', e.target.checked)}
                  label="API"
                />
                <Switch
                  checked={!!settings.integrationSettings?.webhooksEnabled}
                  onChange={(e) => updateSettings('integrationSettings.webhooksEnabled', e.target.checked)}
                  label="Webhooks"
                />
                <Input
                  label="Allowed Origins (CSV)"
                  placeholder="https://app.seu-dominio.com, https://outro.com"
                  value={(settings.integrationSettings?.allowedOrigins ?? []).join(', ')}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);
                    updateSettings('integrationSettings.allowedOrigins', arr);
                  }}
                  fullWidth
                />
                <Divider />
                <Heading level={4}>Rate Limiting</Heading>
                <Switch
                  checked={!!settings.integrationSettings?.rateLimiting?.enabled}
                  onChange={(e) => updateSettings('integrationSettings.rateLimiting.enabled', e.target.checked)}
                  label="Habilitado"
                />
                <Input
                  type="number"
                  label="Requests por minuto"
                  value={settings.integrationSettings?.rateLimiting?.requestsPerMinute ?? 60}
                  onChange={(e) => updateSettings('integrationSettings.rateLimiting.requestsPerMinute', Number(e.target.value))}
                />
              </Grid>
            </CardBody>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving} loading={saving}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </Content>
      )}
    </Page>
  );
};

export default ProviderSettingsPage;

// styled-components
const Page = styled(motion.div)`
  display: grid;
  gap: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #111827;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Centered = styled.div`
  padding: 24px;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  display: grid;
  gap: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 8px 0 0 0;
    color: #374151;
  }

  input[type='text'],
  input[type='number'],
  input[type='email'],
  textarea,
  select {
    font-size: 14px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    outline: none;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }

  input[type='text']:focus,
  input[type='number']:focus,
  input[type='email']:focus,
  textarea:focus,
  select:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.35);
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 10px;
`;
