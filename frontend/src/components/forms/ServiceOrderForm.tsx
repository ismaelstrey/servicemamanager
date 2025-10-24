import React from 'react';
import { 
  Card, 
  Input, 
  TextArea, 
  Select, 
  DatePicker,
  Button
} from '../ui';
import { ServiceOrderStatus, ServiceOrderPriority, ServiceOrderType, ServiceOrderCategory } from '../../types/serviceOrder';

interface ServiceOrderFormData {
  title: string;
  description: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  type: ServiceOrderType;
  category: ServiceOrderCategory;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: string;
  };
  estimatedHours: number;
  estimatedCost: number;
  dueDate: string;
  scheduledDate?: string;
  notes: string;
}

interface ServiceOrderFormProps {
  formData: ServiceOrderFormData;
  onInputChange: (field: string, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showStatusField?: boolean;
  showScheduledDate?: boolean;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'waiting_parts', label: 'Aguardando Peças' },
  { value: 'waiting_customer', label: 'Aguardando Cliente' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' }
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const typeOptions = [
  { value: 'installation', label: 'Instalação' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'repair', label: 'Reparo' },
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'consultation', label: 'Consultoria' }
];

const categoryOptions = [
  { value: 'technical', label: 'Técnico' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'support', label: 'Suporte' },
  { value: 'emergency', label: 'Emergência' }
];

export function ServiceOrderForm({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Salvar',
  showStatusField = false,
  showScheduledDate = false
}: ServiceOrderFormProps) {
  return (
    <form onSubmit={onSubmit} className="service-order-form">
      <div className="service-order-form-grid">
        <div className="service-order-form-main">
          <Card className="service-order-form-card">
            <h2>Informações Básicas</h2>
            
            <div className="service-order-form-group">
              <Input
                label="Título"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                placeholder="Digite o título da ordem de serviço"
                required
                fullWidth
              />
            </div>

            <div className="service-order-form-group">
              <TextArea
                label="Descrição"
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o serviço a ser realizado"
                rows={4}
                required
                fullWidth
              />
            </div>

            <div className="service-order-form-row">
              {showStatusField && (
                <div className="service-order-form-group">
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => onInputChange('status', e.target.value)}
                    fullWidth
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="service-order-form-group">
                <Select
                  label="Prioridade"
                  value={formData.priority}
                  onChange={(e) => onInputChange('priority', e.target.value)}
                  fullWidth
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="service-order-form-row">
              <div className="service-order-form-group">
                <Select
                  label="Tipo"
                  value={formData.type}
                  onChange={(e) => onInputChange('type', e.target.value)}
                  fullWidth
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="service-order-form-group">
                <Select
                  label="Categoria"
                  value={formData.category}
                  onChange={(e) => onInputChange('category', e.target.value)}
                  fullWidth
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card className="service-order-form-card">
            <h2>Informações do Cliente</h2>
            
            <div className="service-order-form-row">
              <div className="service-order-form-group">
                <Input
                  label="Nome"
                  value={formData.customerInfo.name}
                  onChange={(e) => onInputChange('customerInfo.name', e.target.value)}
                  placeholder="Nome do cliente"
                  required
                  fullWidth
                />
              </div>

              <div className="service-order-form-group">
                <Input
                  label="Email"
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => onInputChange('customerInfo.email', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  fullWidth
                />
              </div>
            </div>

            <div className="service-order-form-row">
              <div className="service-order-form-group">
                <Input
                  label="Telefone"
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={(e) => onInputChange('customerInfo.phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  fullWidth
                />
              </div>

              <div className="service-order-form-group">
                <Input
                  label="Empresa"
                  value={formData.customerInfo.company}
                  onChange={(e) => onInputChange('customerInfo.company', e.target.value)}
                  placeholder="Nome da empresa (opcional)"
                  fullWidth
                />
              </div>
            </div>
          </Card>

          <Card className="service-order-form-card">
            <h2>Localização</h2>
            
            <div className="service-order-form-group">
              <Input
                label="Endereço"
                value={formData.location.address}
                onChange={(e) => onInputChange('location.address', e.target.value)}
                placeholder="Rua, número, complemento"
                required
                fullWidth
              />
            </div>

            <div className="service-order-form-row">
              <div className="service-order-form-group">
                <Input
                  label="Cidade"
                  value={formData.location.city}
                  onChange={(e) => onInputChange('location.city', e.target.value)}
                  placeholder="Cidade"
                  required
                  fullWidth
                />
              </div>

              <div className="service-order-form-group">
                <Input
                  label="Estado"
                  value={formData.location.state}
                  onChange={(e) => onInputChange('location.state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                  fullWidth
                />
              </div>

              <div className="service-order-form-group">
                <Input
                  label="CEP"
                  value={formData.location.zipCode}
                  onChange={(e) => onInputChange('location.zipCode', e.target.value)}
                  placeholder="00000-000"
                  required
                  fullWidth
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="service-order-form-sidebar">
          <Card className="service-order-form-card">
            <h2>Estimativas e Prazos</h2>
            
            <div className="service-order-form-group">
              <Input
                label="Horas Estimadas"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => onInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                placeholder="0"
                required
                fullWidth
              />
            </div>

            <div className="service-order-form-group">
              <Input
                label="Custo Estimado (R$)"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => onInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                fullWidth
              />
            </div>

            <div className="service-order-form-group">
              <DatePicker
                label="Data de Vencimento"
                value={formData.dueDate}
                onChange={(e) => onInputChange('dueDate', e.target.value)}
                required
                fullWidth
              />
            </div>

            {showScheduledDate && (
              <div className="service-order-form-group">
                <DatePicker
                  label="Data Agendada"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => onInputChange('scheduledDate', e.target.value)}
                  fullWidth
                />
              </div>
            )}
          </Card>

          <Card className="service-order-form-card">
            <h2>Observações</h2>
            
            <div className="service-order-form-group">
              <TextArea
                label="Notas Adicionais"
                value={formData.notes}
                onChange={(e) => onInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre a ordem de serviço..."
                rows={4}
                fullWidth
              />
            </div>
          </Card>

          <div className="service-order-form-actions">
            <Button
              type="submit"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Salvando...' : submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ServiceOrderForm;

export type { ServiceOrderFormData, ServiceOrderFormProps };