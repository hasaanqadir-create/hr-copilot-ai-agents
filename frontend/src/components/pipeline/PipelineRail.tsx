import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ApplicationStage } from '../../types';

const STAGES: { key: ApplicationStage; label: string; emoji: string }[] = [
  { key: 'submitted', label: 'Intake', emoji: '📄' },
  { key: 'ats_scored', label: 'ATS', emoji: '🤖' },
  { key: 'matched', label: 'Match', emoji: '🎯' },
  { key: 'ranked', label: 'Rank', emoji: '📊' },
  { key: 'interview_scheduled', label: 'Schedule', emoji: '📅' },
  { key: 'interviewed', label: 'Interview', emoji: '💬' },
  { key: 'offer_sent', label: 'Offer', emoji: '📨' },
  { key: 'hired', label: 'Hired', emoji: '✅' },
];

interface PipelineRailProps {
  currentStage: ApplicationStage;
  rejected?: boolean;
  compact?: boolean;
}

export function PipelineRail({ currentStage, rejected, compact }: PipelineRailProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const pct = (activeIndex / (STAGES.length - 1)) * 100;

  const activeColor = rejected ? 'var(--danger)' : 'var(--accent)';
  const glowColor = rejected ? 'rgba(255,95,126,0.4)' : 'rgba(124,111,255,0.4)';

  return (
    <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="relative flex min-w-[580px] items-center justify-between px-2 py-2">
        {/* Track */}
        <div className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <motion.div
          className="absolute left-4 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `calc(${pct}% - 8px)` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: activeColor, boxShadow: `0 0 8px ${glowColor}` }}
        />

        {STAGES.map((stage, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: isActive ? 1.2 : 1 }}
                className={clsx(
                  'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                  compact ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-xs'
                )}
                style={{
                  borderColor: isDone || isActive ? activeColor : 'rgba(255,255,255,0.15)',
                  background: isDone ? activeColor : isActive ? 'transparent' : 'rgba(255,255,255,0.03)',
                  color: isDone ? 'white' : isActive ? activeColor : 'rgba(255,255,255,0.3)',
                  boxShadow: isActive ? `0 0 12px ${glowColor}` : 'none',
                }}
              >
                {isDone ? '✓' : compact ? (i + 1) : stage.emoji}
              </motion.div>
              {!compact && (
                <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-wider"
                  style={{ color: isActive ? activeColor : 'var(--text-muted)', fontWeight: isActive ? 700 : 400 }}>
                  {stage.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
