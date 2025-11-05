import { useEffect, useRef, useState } from 'react';
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
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%', gap: 16, padding: 16 }}>
      <aside>
        <Card variant="outlined">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>Conversas</span>
              <Button size="sm" variant="outline" onClick={handleCreateConversation}>Nova</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Input
                placeholder="Título (opcional)"
                value={newConvTitle}
                onChange={(e) => setNewConvTitle(e.target.value)}
                fullWidth
                size="md"
                variant="outlined"
              />
            </div>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Spinner size="sm" />
                  <span>Carregando...</span>
                </div>
                {[1,2,3,4,5].map((i) => (
                  <Skeleton key={i} height={36} radius={8} />
                ))}
              </div>
            )}
            {error && (
              <Alert variant="error" title="Erro" description="Ocorreu um problema ao carregar ou enviar.">
                {error}
              </Alert>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {conversations.map((c) => (
                <li key={c.id}>
                  <Button
                    variant={selectedConversationId === c.id ? 'primary' : 'outline'}
                    size="md"
                    fullWidth
                    onClick={() => selectConversation(c.id)}
                    style={{ justifyContent: 'flex-start', marginBottom: 8 }}
                  >
                    {c.title || `Conversa #${c.id}`}
                  </Button>
                </li>
              ))}
              {conversations.length === 0 && !loading && (
                <EmptyState title="Nenhuma conversa" description="Crie uma nova conversa para começar." actionLabel="Nova conversa" onAction={() => createConversation(newConvTitle || undefined)} />
              )}
            </ul>
          </CardBody>
        </Card>
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card variant="outlined">
          <CardHeader>
            <span style={{ fontWeight: 600 }}>Mensagens</span>
          </CardHeader>
          <CardBody>
            {!selectedConversationId && (
              <EmptyState title="Selecione uma conversa" description="Escolha uma conversa à esquerda para visualizar mensagens." />
            )}
            {selectedConversationId && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 12, maxHeight: '50vh' }}>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[1,2,3].map((i) => (
                        <div key={i}>
                          <Skeleton width="40%" height={12} />
                          <div style={{ marginTop: 8 }}>
                            <Skeleton height={18} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && messages.map((m) => (
                    <div key={m.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {m.direction.toUpperCase()} • {new Date(m.createdAt).toLocaleString()}
                      </div>
                      {m.content && <div style={{ marginTop: 4 }}>{m.content}</div>}
                      {m.attachments?.map((a, idx) => (
                        <div key={`${m.id}-att-${idx}`} style={{ marginTop: 6 }}>
                          <a href={a.url} target="_blank" rel="noreferrer">{a.mimeType || 'arquivo'}</a>
                          {a.size ? ` • ${(a.size / 1024).toFixed(1)}KB` : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                  {!loading && messages.length === 0 && (
                    <EmptyState title="Sem mensagens" description="Envie uma mensagem ou anexe um arquivo." />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
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
                </div>
              </>
            )}
          </CardBody>
        </Card>
        </div>
      </main>
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        title={toastTitle}
        description={toastDesc}
        variant={toastVariant}
      />
    </div>
  );
}