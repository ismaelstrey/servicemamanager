import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../hooks/useChat';
import { Card, CardHeader, CardBody, Button, Input, Spinner, Alert, EmptyState, Toast, Skeleton } from '../../components/ui';

export default function ChatPage() {
  const {
    conversations,
    messages,
    selectedConversationId,
    loading,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    uploadAttachment,
    createConversation,
  } = useChat({ autoConnect: true });

  const [newConvTitle, setNewConvTitle] = useState('');
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState<string | undefined>(undefined);
  const [toastDesc, setToastDesc] = useState<string | undefined>(undefined);
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const showToast = (variant: 'info' | 'success' | 'warning' | 'error', title?: string, description?: string) => {
    setToastVariant(variant);
    setToastTitle(title);
    setToastDesc(description);
    setToastOpen(true);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage(input.trim());
      setInput('');
      showToast('success', 'Mensagem enviada', 'Sua mensagem foi enviada com sucesso.');
    } catch (e: any) {
      showToast('error', 'Falha ao enviar', e?.message || 'Não foi possível enviar a mensagem.');
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    try {
      await uploadAttachment(file);
      if (fileRef.current) fileRef.current.value = '';
      showToast('success', 'Anexo enviado', 'O arquivo foi anexado à conversa.');
    } catch (e: any) {
      showToast('error', 'Falha no upload', e?.message || 'Não foi possível anexar o arquivo.');
    }
  };

  const handleCreateConversation = async () => {
    try {
      await createConversation(newConvTitle || undefined);
      showToast('success', 'Conversa criada', 'A nova conversa foi criada.');
      setNewConvTitle('');
    } catch (e: any) {
      showToast('error', 'Falha ao criar conversa', e?.message || 'Não foi possível criar a conversa.');
    }
  };

  return (
    <LayoutGrid>
      <aside>
        <Card variant="outlined">
          <CardHeader>
            <HeaderRow>
              <HeaderTitle>Conversas</HeaderTitle>
              <Button size="sm" variant="outline" onClick={handleCreateConversation}>Nova</Button>
            </HeaderRow>
          </CardHeader>
          <CardBody>
            <ControlsRow>
              <Input
                placeholder="Título (opcional)"
                value={newConvTitle}
                onChange={(e) => setNewConvTitle(e.target.value)}
                fullWidth
                size="md"
                variant="outlined"
              />
            </ControlsRow>
            {loading && (
              <LoadingBlock>
                <LoadingRow>
                  <Spinner size="sm" />
                  <span>Carregando...</span>
                </LoadingRow>
                {[1,2,3,4,5].map((i) => (
                  <Skeleton key={i} height={36} radius={8} />
                ))}
              </LoadingBlock>
            )}
            {error && (
              <Alert variant="error" title="Erro" description="Ocorreu um problema ao carregar ou enviar.">
                {error}
              </Alert>
            )}
            <ConversationsList>
              {conversations.map((c) => (
                <ConversationItem key={c.id}>
                  <Button
                    variant={selectedConversationId === c.id ? 'primary' : 'outline'}
                    size="md"
                    fullWidth
                    onClick={() => selectConversation(c.id)}
                  >
                    {c.title || `Conversa #${c.id}`}
                  </Button>
                </ConversationItem>
              ))}
              {conversations.length === 0 && !loading && (
                <EmptyState title="Nenhuma conversa" description="Crie uma nova conversa para começar." actionLabel="Nova conversa" onAction={() => createConversation(newConvTitle || undefined)} />
              )}
            </ConversationsList>
          </CardBody>
        </Card>
      </aside>
      <MainWrap>
        <InnerMain>
        <Card variant="outlined">
          <CardHeader>
            <HeaderTitle>Mensagens</HeaderTitle>
          </CardHeader>
          <CardBody>
            {!selectedConversationId && (
              <EmptyState title="Selecione uma conversa" description="Escolha uma conversa à esquerda para visualizar mensagens." />
            )}
            {selectedConversationId && (
              <>
                <MessagesViewport>
                  {loading && (
                    <SkeletonBlock>
                      {[1,2,3].map((i) => (
                        <SkeletonRow key={i}>
                          <Skeleton width="40%" height={12} />
                          <SkeletonSpacer>
                            <Skeleton height={18} />
                          </SkeletonSpacer>
                        </SkeletonRow>
                      ))}
                    </SkeletonBlock>
                  )}
                  {!loading && messages.map((m) => (
                    <MessageItem key={m.id}>
                      <MetaText>
                        {m.direction.toUpperCase()} • {new Date(m.createdAt).toLocaleString()}
                      </MetaText>
                      {m.content && <MessageContent>{m.content}</MessageContent>}
                      {m.attachments?.map((a, idx) => (
                        <Attachment key={`${m.id}-att-${idx}`}>
                          <a href={a.url} target="_blank" rel="noreferrer">{a.mimeType || 'arquivo'}</a>
                          {a.size ? ` • ${(a.size / 1024).toFixed(1)}KB` : ''}
                        </Attachment>
                      ))}
                    </MessageItem>
                  ))}
                  {!loading && messages.length === 0 && (
                    <EmptyState title="Sem mensagens" description="Envie uma mensagem ou anexe um arquivo." />
                  )}
                </MessagesViewport>
                <ComposerRow>
                  <Input
                    placeholder="Escreva uma mensagem"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    fullWidth
                    size="md"
                    variant="outlined"
                  />
                  <Button onClick={handleSend} variant="primary">Enviar</Button>
                  <Input type="file" ref={fileRef} size="md" variant="outlined" />
                  <Button onClick={handleUpload} variant="secondary">Anexar</Button>
                </ComposerRow>
              </>
            )}
          </CardBody>
        </Card>
        </InnerMain>
      </MainWrap>
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={toastTitle}
        description={toastDesc}
        variant={toastVariant}
      />
    </LayoutGrid>
  );
}

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100%;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderTitle = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoadingBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoadingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ConversationsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ConversationItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MainWrap = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const InnerMain = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MessagesViewport = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-height: 50vh;
`;

const SkeletonBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SkeletonRow = styled.div``;

const SkeletonSpacer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const MessageItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetaText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MessageContent = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Attachment = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ComposerRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;