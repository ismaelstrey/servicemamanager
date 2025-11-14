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
  AuthFooter,
  AuthGrid,
  BrandSection,
  BrandLogo,
  BrandHeading,
  BrandSubtitle,
} from './AuthTemplate.styles';

interface AuthTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundImage?: string;
  className?: string;
  footer?: React.ReactNode;
  layout?: 'simple' | 'split';
  brandLogoSrc?: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  backgroundImage,
  className,
  footer,
  layout = 'simple',
  brandLogoSrc,
  ...props
}) => {
  return (
    <AuthContainer
      backgroundImage={backgroundImage}
      className={className}
      {...props}
    >
      <BackgroundPattern />
      <AuthCard $wide={layout === 'split'}>
        {layout === 'split' ? (
          <AuthGrid>
            <BrandSection>
              {brandLogoSrc && (
                <BrandLogo>
                  <img src={brandLogoSrc} alt={title} loading="lazy" />
                </BrandLogo>
              )}
              <BrandHeading>{title}</BrandHeading>
              {subtitle && <BrandSubtitle>{subtitle}</BrandSubtitle>}
            </BrandSection>

            <div>
              <AuthHeader>
                <AuthTitle>{title}</AuthTitle>
                {subtitle && <AuthSubtitle>{subtitle}</AuthSubtitle>}
              </AuthHeader>
              <AuthContent>
                {children}
              </AuthContent>
              {footer && <AuthFooter>{footer}</AuthFooter>}
            </div>
          </AuthGrid>
        ) : (
          <>
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
            {footer && <AuthFooter>{footer}</AuthFooter>}
          </>
        )}
      </AuthCard>
    </AuthContainer>
  );
};
