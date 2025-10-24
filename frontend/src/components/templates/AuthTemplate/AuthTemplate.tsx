import React from 'react';
import {
  AuthContainer,
  AuthCard,
  LogoContainer,
  Logo,
  AuthHeader,
  AuthTitle,
  AuthSubtitle,
  AuthContent,
  BackgroundPattern,
} from './AuthTemplate.styles';

interface AuthTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundImage?: string;
  className?: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  backgroundImage,
  className,
  ...props
}) => {
  return (
    <AuthContainer
      backgroundImage={backgroundImage}
      className={className}
      {...props}
    >
      <BackgroundPattern />
      <AuthCard>
        {showLogo && (
          <LogoContainer>
            <Logo>
              T
            </Logo>
          </LogoContainer>
        )}
        
        <AuthHeader>
          <AuthTitle>{title}</AuthTitle>
          {subtitle && <AuthSubtitle>{subtitle}</AuthSubtitle>}
        </AuthHeader>
        
        <AuthContent>
          {children}
        </AuthContent>
      </AuthCard>
    </AuthContainer>
  );
};