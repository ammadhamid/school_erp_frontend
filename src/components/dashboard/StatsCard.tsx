import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const StatsCard = ({ title, value, icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn('shadow-card hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.positive ? '+' : '-'}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
