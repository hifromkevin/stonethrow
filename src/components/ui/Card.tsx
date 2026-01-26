import React, { ReactNode } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <article className={className}>{children}</article>
);

export default Card;
