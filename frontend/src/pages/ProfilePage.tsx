import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../components/ui/Tabs'
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { FileUpload } from '../components/ui/FileUpload'
import { Radio } from '../components/ui/Radio'
import { Checkbox } from '../components/ui/Checkbox'
import useProfile from '../hooks/useProfile'

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

// Função utilitária para fazer crop quadrado do avatar selecionado
// Comentários em português BR conforme padrão do projeto
async function cropImageToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const startX = Math.floor((img.width - size) / 2)
        const startY = Math.floor((img.height - size) / 2)
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Contexto de canvas não disponível'))
          return
        }
        ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Falha ao carregar imagem'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

const ProfilePage: React.FC = () => {
  const { profile, loading, error, saveProfile, theme, setThemePreference, notifications, setNotifications, privacy, setPrivacy } = useProfile()

  // Estados locais para edição inline
  const [name, setName] = useState<string>(profile?.name || '')
  const [email] = useState<string>(profile?.email || '')
  const [phone, setPhone] = useState<string>('')
  const [document, setDocument] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState<boolean>(false)

  React.useEffect(() => {
    setName(profile?.name || '')
    // Manter email somente leitura; caso exista no perfil do cliente
    // Campos extras podem ser carregados futuramente a partir da API
  }, [profile])

  const canSave = useMemo(() => {
    return name.trim().length > 1 && !saving
  }, [name, saving])

  const handleSaveProfile = useCallback(async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await saveProfile({ name: name.trim(), phone, document, address: address ? { raw: address } : undefined, avatar: avatarPreview })
    } catch (e) {
      // Erro já tratado no hook com mensagem
    } finally {
      setSaving(false)
    }
  }, [canSave, name, phone, document, address, avatarPreview, saveProfile])

  const handleAvatarSelected = useCallback(async (files: FileList) => {
    const file = files?.[0]
    if (!file) return
    try {
      const cropped = await cropImageToSquare(file)
      setAvatarPreview(cropped)
    } catch (e) {
      console.warn('Falha ao processar avatar', e)
    }
  }, [])

  return (
    <Container>
      <TitleRow>
        <Title>Perfil do Usuário</Title>
      </TitleRow>

      {error && (
        <Card variant="outlined">
          <CardBody>
            <p style={{ color: '#d32f2f' }}>{error}</p>
          </CardBody>
        </Card>
      )}

      <Tabs defaultTab="perfil" variant="underline">
        <TabList>
          <Tab value="perfil">Perfil</Tab>
          <Tab value="aparencia">Aparência</Tab>
          <Tab value="notificacoes">Notificações</Tab>
          <Tab value="privacidade">Privacidade</Tab>
          <Tab value="atividades">Atividades</Tab>
        </TabList>

        <TabPanels>
          {/* Perfil */}
          <TabPanel value="perfil">
            <Card variant="elevated">
              <CardHeader>
                <h3>Informações do Perfil</h3>
              </CardHeader>
              <CardBody>
                <AvatarWrapper>
                  <Avatar src={avatarPreview} name={name || profile?.name} size="lg" />
                  <FileUpload label="Alterar avatar" accept="image/*" onFilesSelected={handleAvatarSelected} />
                  {avatarPreview && (
                    <Button variant="ghost" onClick={() => setAvatarPreview(undefined)}>Remover</Button>
                  )}
                </AvatarWrapper>

                <Row style={{ marginTop: '1rem' }}>
                  <Input label="Nome" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
                  <Input label="E-mail" placeholder="email@exemplo.com" value={email} readOnly fullWidth />
                </Row>
                <Row>
                  <Input label="Telefone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
                  <Input label="Documento" placeholder="CPF/CNPJ" value={document} onChange={(e) => setDocument(e.target.value)} fullWidth />
                </Row>
                <Row>
                  <Input label="Endereço" placeholder="Rua, número, cidade" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
                </Row>
              </CardBody>
              <CardFooter>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="secondary" onClick={() => {
                    setName(profile?.name || '')
                    setPhone('')
                    setDocument('')
                    setAddress('')
                    setAvatarPreview(undefined)
                  }}>Cancelar</Button>
                  <Button variant="primary" onClick={handleSaveProfile} disabled={!canSave} loading={saving}>
                    Salvar alterações
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabPanel>

          {/* Aparência */}
          <TabPanel value="aparencia">
            <Card variant="elevated">
              <CardHeader>
                <h3>Preferências de Aparência</h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Radio name="theme" label="Claro" checked={theme === 'light'} onChange={() => setThemePreference('light')} />
                  <Radio name="theme" label="Escuro" checked={theme === 'dark'} onChange={() => setThemePreference('dark')} />
                  <Radio name="theme" label="Sistema" checked={theme === 'system'} onChange={() => setThemePreference('system')} />
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Notificações */}
          <TabPanel value="notificacoes">
            <Card variant="elevated">
              <CardHeader>
                <h3>Configurações de Notificações</h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Checkbox label="Receber por e-mail" checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.currentTarget.checked })} />
                  <Checkbox label="Receber push" checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.currentTarget.checked })} />
                  <Checkbox label="Alertas na área de trabalho" checked={notifications.desktop} onChange={(e) => setNotifications({ ...notifications, desktop: e.currentTarget.checked })} />
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Privacidade */}
          <TabPanel value="privacidade">
            <Card variant="elevated">
              <CardHeader>
                <h3>Preferências de Privacidade</h3>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Visibilidade do perfil</p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Radio name="visibility" label="Público" checked={privacy.profileVisibility === 'public'} onChange={() => setPrivacy({ ...privacy, profileVisibility: 'public' })} />
                    <Radio name="visibility" label="Privado" checked={privacy.profileVisibility === 'private'} onChange={() => setPrivacy({ ...privacy, profileVisibility: 'private' })} />
                    <Radio name="visibility" label="Somente equipe" checked={privacy.profileVisibility === 'team_only'} onChange={() => setPrivacy({ ...privacy, profileVisibility: 'team_only' })} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Checkbox label="Mostrar status online" checked={privacy.showOnlineStatus} onChange={(e) => setPrivacy({ ...privacy, showOnlineStatus: e.currentTarget.checked })} />
                  <Checkbox label="Permitir mensagens diretas" checked={privacy.allowDirectMessages} onChange={(e) => setPrivacy({ ...privacy, allowDirectMessages: e.currentTarget.checked })} />
                  <Checkbox label="Compartilhar status de atividade" checked={privacy.shareActivityStatus} onChange={(e) => setPrivacy({ ...privacy, shareActivityStatus: e.currentTarget.checked })} />
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Atividades */}
          <TabPanel value="atividades">
            <Card variant="elevated">
              <CardHeader>
                <h3>Histórico de Atividades</h3>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <p>Carregando atividades...</p>
                ) : (
                  <p>Em breve você verá suas atividades recentes aqui.</p>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default ProfilePage