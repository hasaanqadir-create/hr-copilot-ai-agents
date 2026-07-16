interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
}

export function ScoreRing({ score, label, size = 88 }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? 'var(--success)' :
    score >= 50 ? 'var(--warn)' :
    'var(--danger)';

  const glowColor =
    score >= 75 ? 'rgba(0,212,170,0.4)' :
    score >= 50 ? 'rgba(255,179,71,0.4)' :
    'rgba(255,95,126,0.4)';

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              transition: 'stroke-dashoffset 0.8s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}
