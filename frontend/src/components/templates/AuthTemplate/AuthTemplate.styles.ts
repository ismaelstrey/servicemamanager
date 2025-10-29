import styled from 'styled-components';

export const AuthContainer = styled.div<{ backgroundImage?: string }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, backgroundImage }) => 
    backgroundImage 
      ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`
      : `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`
  };
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const AuthCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.lg};
    margin: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const Logo = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borders.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.contrast};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const AuthTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

export const AuthSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const AuthContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const AuthFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border.secondary};
`;

export const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at 25% 25%, ${({ theme }) => theme.colors.primary.light} 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, ${({ theme }) => theme.colors.secondary.light} 0%, transparent 50%);
  pointer-events: none;
`;