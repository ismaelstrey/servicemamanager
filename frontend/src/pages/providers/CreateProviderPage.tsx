import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface CreateProviderForm {
  name: string;
  cnpj: string;
  email: string;
  workspace?: string;
  phone?: string;
}

export default function CreateProviderPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [form, setForm] = useState<CreateProviderForm>({
    name: '',
    cnpj: '',
    email: '',
    workspace: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Máscara de CNPJ: 00.000.000/0000-00
  const formatCNPJ = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
      .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, '$1-$2');
  };

  // Máscara de telefone BR: (00) 0000-0000 ou (00) 00000-0000
  const formatPhoneBR = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/^(\(\d{2}\) \d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^(\(\d{2}\) \d{5})(\d{4}).*/, '$1-$2');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'cnpj') {
      nextValue = formatCNPJ(value);
    }
    if (name === 'phone') {
      nextValue = formatPhoneBR(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    // Ao editar um campo, limpamos o erro específico
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const clone = { ...prev };
        delete clone[name as keyof typeof prev];
        return clone;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Campos mínimos obrigatórios pelo backend: name, cnpj, email
    if (!form.name || !form.cnpj || !form.email) {
      setError('Preencha nome, CNPJ e e-mail.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateProviderForm = {
        name: form.name.trim(),
        cnpj: form.cnpj.trim(),
        email: form.email.trim(),
        workspace: form.workspace?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
      };

      const res = await ApiService.post<any>('/providers', payload);
      const providerId = res?.data?.data?.provider?.id ?? res?.data?.provider?.id ?? res?.data?.id;

      if (providerId) {
        updateUser({ providerId });
        navigate('/dashboard');
      } else {
        setError('Não foi possível obter o ID do provedor. Tente novamente.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao criar provedor';
      setError(message);

      const errorsArr = err?.response?.data?.errors;
      if (Array.isArray(errorsArr)) {
        const next: Record<string, string> = {};
        for (const item of errorsArr) {
          if (item?.field && item?.message) {
            next[item.field] = item.message;
          }
        }
        setFieldErrors(next);
      }
      console.error('CreateProvider error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Criar Provedor</h1>
      <p style={{ marginBottom: 24, color: '#666' }}>
        Crie seu provedor para acessar o dashboard e gerenciar seus recursos.
      </p>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: '#ffe7e7', color: '#b00000', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span>Nome do Provedor *</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: NetFiber Telecom"
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {fieldErrors.name && (
              <span style={{ color: 'crimson', fontSize: 12 }}>{fieldErrors.name}</span>
            )}
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span>CNPJ *</span>
            <input
              type="text"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {fieldErrors.cnpj && (
              <span style={{ color: 'crimson', fontSize: 12 }}>{fieldErrors.cnpj}</span>
            )}
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span>E-mail *</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contato@seuprovedor.com"
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {fieldErrors.email && (
              <span style={{ color: 'crimson', fontSize: 12 }}>{fieldErrors.email}</span>
            )}
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span>Workspace (opcional)</span>
            <input
              type="text"
              name="workspace"
              value={form.workspace}
              onChange={handleChange}
              placeholder="slug-do-workspace (ex: netfiber)"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {fieldErrors.workspace && (
              <span style={{ color: 'crimson', fontSize: 12 }}>{fieldErrors.workspace}</span>
            )}
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span>Telefone (opcional)</span>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
            />
            {fieldErrors.phone && (
              <span style={{ color: 'crimson', fontSize: 12 }}>{fieldErrors.phone}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: submitting ? '#999' : '#2563eb',
              color: '#fff',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Criando...' : 'Criar Provedor'}
          </button>
        </div>
      </form>
    </div>
  );
}