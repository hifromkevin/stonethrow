import React, { ReactNode } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <article className={`rounded-md bg-white ring-slate-200 ${className}`}>
    {children}
  </article>
);

export default Card;
