import React from 'react';
import { cn } from '../../utils/cn';

interface SectionWrapperProps {
  children: React.ReactNode;
  bg?: 'default' | 'surface' | 'elevated';
  className?: string;
  id?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  bg = 'default',
  className = '',
  id,
}) => {
  const bgClass =
    bg === 'surface'
      ? 'bg-[var(--color-surface)] border-y border-[var(--color-border)]'
      : bg === 'elevated'
      ? 'bg-[var(--color-surface-elevated)] border-y border-[var(--color-border)]'
      : 'bg-[var(--color-bg)]';

  return (
    <section id={id} className={cn('section', bgClass, className)}>
      <div className="container-main">{children}</div>
    </section>
  );
};
