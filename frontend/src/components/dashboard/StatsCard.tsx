import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Badge, CardBody } from '../ui';

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
  tooltip?: string;
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
  tooltip,
}) => {
  const isNumeric = useMemo(() => typeof value === 'number', [value]);
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const prevValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isNumeric || loading) {
      setDisplayValue(value);
      return;
    }

    const target = Number(value);
    const start = prevValueRef.current ?? 0;
    prevValueRef.current = target;

    const duration = 600; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const current = Math.round(start + (target - start) * t);
      setDisplayValue(current);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value, isNumeric, loading]);

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
      title={tooltip}
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
                  {displayValue}
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