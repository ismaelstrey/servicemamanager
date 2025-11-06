import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
    <Page initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Title>Criar Provedor</Title>
      <Subtitle>Crie seu provedor para acessar o dashboard e gerenciar seus recursos.</Subtitle>

      <AnimatePresence>{error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ErrorBox>{error}</ErrorBox>
        </motion.div>
      )}</AnimatePresence>

      <Form onSubmit={handleSubmit}>
        <Field>
          <label>Nome do Provedor *</label>
          <InputText
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: NetFiber Telecom"
            required
          />
          {fieldErrors.name && (
            <FieldError>{fieldErrors.name}</FieldError>
          )}
        </Field>

        <Field>
          <label>CNPJ *</label>
          <InputText
            type="text"
            name="cnpj"
            value={form.cnpj}
            onChange={handleChange}
            placeholder="00.000.000/0000-00"
            required
          />
          {fieldErrors.cnpj && (
            <FieldError>{fieldErrors.cnpj}</FieldError>
          )}
        </Field>

        <Field>
          <label>E-mail *</label>
          <InputText
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="contato@seuprovedor.com"
            required
          />
          {fieldErrors.email && (
            <FieldError>{fieldErrors.email}</FieldError>
          )}
        </Field>

        <Field>
          <label>Workspace (opcional)</label>
          <InputText
            type="text"
            name="workspace"
            value={form.workspace}
            onChange={handleChange}
            placeholder="slug-do-workspace (ex: netfiber)"
          />
          {fieldErrors.workspace && (
            <FieldError>{fieldErrors.workspace}</FieldError>
          )}
        </Field>

        <Field>
          <label>Telefone (opcional)</label>
          <InputText
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
          {fieldErrors.phone && (
            <FieldError>{fieldErrors.phone}</FieldError>
          )}
        </Field>

        <Submit type="submit" disabled={submitting} $submitting={submitting}>
          {submitting ? 'Criando...' : 'Criar Provedor'}
        </Submit>
      </Form>
    </Page>
  );
}

// styled-components
const Page = styled(motion.div)`
  max-width: 640px;
  margin: 40px auto;
  padding: 24px;
`;

const Title = styled.h1`
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  margin-bottom: 24px;
  color: #666;
`;

const ErrorBox = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #ffe7e7;
  color: #b00000;
  border-radius: 8px;
`;

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
`;

const InputText = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const FieldError = styled.span`
  color: crimson;
  font-size: 12px;
`;

const Submit = styled.button<{ $submitting?: boolean }>`
  margin-top: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  background: ${({ $submitting }) => ($submitting ? '#999' : '#2563eb')};
  color: #fff;
  cursor: ${({ $submitting }) => ($submitting ? 'not-allowed' : 'pointer')};
`;