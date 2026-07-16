import { motion } from 'framer-motion';
import { Application } from '../../types';
import { Card, CardBody } from '../ui/Card';
import { PipelineRail } from '../pipeline/PipelineRail';
import { Badge } from '../ui/primitives';
import { ScoreRing } from '../ui/ScoreRing';

export function ApplicationCard({ application, index = 0 }: { application: Application; index?: number }) {
  const isRejected = application.stage === 'rejected';
  const isHired = application.stage === 'hired';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card>
        <CardBody>
          <div className="flex items-start gap-4 mb-4">
            {application.matchResult && (
              <ScoreRing score={application.matchResult.matchPercentage} label="Match" size={68} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base font-semibold text-primary">{application.candidate.name}</h3>
                <div className="flex items-center gap-2">
                  {typeof application.rankScore === 'number' && (
                    <Badge tone={application.rankScore >= 70 ? 'success' : application.rankScore >= 50 ? 'warn' : 'danger'}>
                      Rank {application.rankScore}
                    </Badge>
                  )}
                  {isHired && <Badge tone="gradient">✓ Hired</Badge>}
                  {isRejected && <Badge tone="danger">Rejected</Badge>}
                </div>
              </div>
              <p className="text-xs text-muted mb-3">{application.candidate.email}</p>

              {application.matchResult?.bestFitNotes && (
                <p className="text-sm text-secondary line-clamp-2">{application.matchResult.bestFitNotes}</p>
              )}
            </div>
          </div>

          <PipelineRail currentStage={application.stage} rejected={isRejected} compact />

          {application.matchResult && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="flex flex-wrap gap-2">
                {application.matchResult.matchedSkills.slice(0, 5).map((s) => (
                  <Badge key={s} tone="success">{s}</Badge>
                ))}
                {application.matchResult.missingSkills.slice(0, 3).map((s) => (
                  <Badge key={s} tone="warn">missing: {s}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
