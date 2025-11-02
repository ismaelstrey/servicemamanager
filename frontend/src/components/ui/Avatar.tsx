import React from 'react';
import styled, { css } from 'styled-components';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'none' | 'online' | 'offline' | 'busy';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const Wrapper = styled.div<{ size: AvatarSize }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.muted};
  color: ${({ theme }) => theme.colors.text.muted};
  user-select: none;

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`width: 28px; height: 28px; font-size: 12px;`;
      case 'lg':
        return css`width: 48px; height: 48px; font-size: 18px;`;
      default:
        return css`width: 36px; height: 36px; font-size: 14px;`;
    }
  }}
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Initials = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const StatusDot = styled.span<{ status: AvatarStatus }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};

  ${({ status, theme }) => {
    switch (status) {
      case 'online':
        return css`background: ${theme.colors.success.main};`;
      case 'busy':
        return css`background: ${theme.colors.warning.main};`;
      case 'offline':
        return css`background: ${theme.colors.text.muted};`;
      default:
        return css`display: none;`;
    }
  }}
`;

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', status = 'none', ...props }) => {
  const initials = getInitials(name);

  return (
    <Wrapper size={size} aria-label={name} {...props}>
      {src ? <Img src={src} alt={alt ?? name ?? 'avatar'} /> : <Initials>{initials}</Initials>}
      <StatusDot status={status} />
    </Wrapper>
  );
};

export default Avatar;