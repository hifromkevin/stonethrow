import React, { ReactNode } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <section
    className={`rounded-xl bg-white shadow-md ring-1 ring-slate-200 ${className}`}
  >
    {children}
  </section>
);

export default Card;
