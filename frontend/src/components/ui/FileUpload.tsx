import React from 'react';
import styled from 'styled-components';

export interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onFilesSelected?: (files: FileList) => void;
}

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.ui.label.fontSize};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFilesSelected, ...props }) => {
  const id = React.useId();
  return (
    <Wrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="file"
        onChange={(e) => e.target.files && onFilesSelected?.(e.target.files)}
        {...props}
      />
    </Wrapper>
  );
};

export default FileUpload;