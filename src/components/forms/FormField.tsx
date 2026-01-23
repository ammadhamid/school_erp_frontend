import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({ label, htmlFor, required, error, children, className }: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className={cn(error && 'text-destructive')}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default FormField;
