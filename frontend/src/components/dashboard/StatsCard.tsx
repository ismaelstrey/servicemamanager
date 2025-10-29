import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CardBody } from '../ui/Card';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  loading = false,
  onClick,
}) => {
  const getTrendColor = (isPositive: boolean) => {
    return isPositive ? 'success' : 'danger';
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? '↗' : '↘';
  };

  return (
    <Card
      variant="default"
      hoverable={!!onClick}
      clickable={!!onClick}
      onClick={onClick}
      className="stats-card"
    >
      <CardBody>
        <div className="stats-card__header">
          <div className="stats-card__title-section">
            <h3 className="stats-card__title">{title}</h3>
            {subtitle && (
              <p className="stats-card__subtitle">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`stats-card__icon stats-card__icon--${color}`}>
              {icon}
            </div>
          )}
        </div>

        <div className="stats-card__content">
          <div className="stats-card__value-section">
            {loading ? (
              <div className="stats-card__skeleton">
                <div className="stats-card__skeleton-value" />
                <div className="stats-card__skeleton-trend" />
              </div>
            ) : (
              <>
                <span className={`stats-card__value stats-card__value--${color}`}>
                  {value}
                </span>
                {trend && (
                  <Badge
                    variant={getTrendColor(trend.isPositive)}
                    size="sm"
                    className="stats-card__trend"
                  >
                    <span className="stats-card__trend-icon">
                      {getTrendIcon(trend.isPositive)}
                    </span>
                    <span className="stats-card__trend-value">
                      {Math.abs(trend.value)}%
                    </span>
                    <span className="stats-card__trend-label">
                      {trend.label}
                    </span>
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatsCard;