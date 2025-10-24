import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { QuickAction } from '../../utils/quickActions';

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className = '',
}) => {
  return (
    <Card variant="default" className={`quick-actions ${className}`}>
      <Card.Header>
        <h3 className="quick-actions__title">Ações Rápidas</h3>
      </Card.Header>

      <Card.Body>
        <div className="quick-actions__grid">
          {actions.map((action) => (
            <div
              key={action.id}
              className="quick-actions__item"
            >
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={action.onClick}
                disabled={action.disabled}
                className={`quick-actions__button quick-actions__button--${action.color}`}
              >
                <div className="quick-actions__button-content">
                  <div className={`quick-actions__icon quick-actions__icon--${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="quick-actions__text">
                    <span className="quick-actions__button-title">
                      {action.title}
                    </span>
                    <span className="quick-actions__button-description">
                      {action.description}
                    </span>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuickActions;