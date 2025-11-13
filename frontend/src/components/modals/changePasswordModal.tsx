import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Modal, ModalBody, ModalFooter, Input, Button } from '../ui';

export interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void> | void;
    title?: string;
}

const Form = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit, title = 'Alterar Senha' }) => {
    const [password, setPassword] = useState('');
    const handleSave = async () => {
        await onSubmit(password);
        setPassword('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <ModalBody>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <Form>
                        <Input
                            label="Nova senha"
                            type="password"
                            placeholder="Digite a nova senha"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            fullWidth
                        />
                    </Form>
                </motion.div>
            </ModalBody>
            <ModalFooter>
                <FooterRow>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Salvar</Button>
                </FooterRow>
            </ModalFooter>
        </Modal>
    );
};

export default ChangePasswordModal;