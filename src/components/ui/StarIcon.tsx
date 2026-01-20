import { Star } from '@/types';

const StarIcon = ({ isStarSelected, setIsStarSelected }: Star) => (
  <span
    aria-pressed={isStarSelected}
    onClick={() => setIsStarSelected((v: boolean) => !v)}
    className="text-slate-400 hover:text-amber-500"
  >
    {isStarSelected ? '★' : '☆'}
  </span>
);
export default StarIcon;
