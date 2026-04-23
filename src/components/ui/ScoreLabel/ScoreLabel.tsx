import {
  getRankLabel,
  SCORE_LABEL_STYLES,
  type ScoreLabelInfo,
} from '@/lib/scoring/score-labels';

type ScoreLabelProps = {
  rank: number;
  size?: 'sm' | 'md';
};

/**
 * Displays a rank-based match label.
 * Rank 1 → "Top Match" (filled star), 2–4 → "Strong Match", 5–7 → "Good Match", 8+ → nothing.
 */
const ScoreLabel = ({ rank, size = 'sm' }: ScoreLabelProps) => {
  const labelInfo = getRankLabel(rank);
  if (!labelInfo) return null;
  const styles = SCORE_LABEL_STYLES[labelInfo.category];

  const sizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px] md:px-2 md:text-xs whitespace-nowrap'
      : 'px-3 py-1 text-sm whitespace-nowrap';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${styles.bg} ${styles.text} ${sizeClasses}`}
    >
      {labelInfo.label === 'Top Match' && (
        <TopMatchIndicator tier={labelInfo.tier} />
      )}
      {labelInfo.label}
    </span>
  );
};

/**
 * Visual indicator for Top Match tier differentiation.
 * High tier (85+) = filled star
 * Standard tier (75-84) = outlined star
 */
const TopMatchIndicator = ({ tier }: { tier: ScoreLabelInfo['tier'] }) => {
  if (tier === 'high') {
    // Filled star for 85+
    return (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-label="Top tier match"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  // Half-filled star for 75-84
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-label="Strong match"
    >
      <defs>
        <linearGradient id="halfFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        fill="url(#halfFill)"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
};

export default ScoreLabel;
