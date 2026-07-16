import { motion } from 'framer-motion';
import { Candidate } from '../../types';
import { Card, CardBody } from '../ui/Card';
import { ScoreRing } from '../ui/ScoreRing';
import { Badge } from '../ui/primitives';
import { MapPin, Phone, Linkedin, Github, GraduationCap } from 'lucide-react';

export function CandidateCard({ candidate, index = 0 }: { candidate: Candidate; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="hover:scale-[1.01] transition-transform duration-200">
        <CardBody className="flex items-start gap-5">
          {candidate.atsResult ? (
            <ScoreRing score={candidate.atsResult.score} label="ATS Score" size={80} />
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs text-muted">Pending</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-display text-lg font-semibold text-primary">{candidate.name}</h3>
              {candidate.parsed?.experienceYears !== undefined && (
                <Badge tone="accent">{candidate.parsed.experienceYears}y exp</Badge>
              )}
            </div>
            <p className="text-sm text-muted mb-3">{candidate.email}</p>

            {/* Contact info */}
            {candidate.parsed?.contact && (
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted">
                {candidate.parsed.contact.location && (
                  <span className="flex items-center gap-1"><MapPin size={11} />{candidate.parsed.contact.location}</span>
                )}
                {candidate.parsed.contact.phone && (
                  <span className="flex items-center gap-1"><Phone size={11} />{candidate.parsed.contact.phone}</span>
                )}
                {candidate.parsed.contact.linkedin && (
                  <span className="flex items-center gap-1"><Linkedin size={11} />LinkedIn</span>
                )}
                {candidate.parsed.contact.github && (
                  <span className="flex items-center gap-1"><Github size={11} />GitHub</span>
                )}
              </div>
            )}

            {candidate.parsed?.summary && (
              <p className="text-sm text-secondary line-clamp-2 mb-3">{candidate.parsed.summary}</p>
            )}

            {/* Skills */}
            {candidate.parsed?.skills && candidate.parsed.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {candidate.parsed.skills.slice(0, 8).map((skill) => (
                  <Badge key={skill} tone="neutral">{skill}</Badge>
                ))}
                {candidate.parsed.skills.length > 8 && (
                  <Badge tone="neutral">+{candidate.parsed.skills.length - 8} more</Badge>
                )}
              </div>
            )}

            {/* Education */}
            {candidate.parsed?.education && candidate.parsed.education.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <GraduationCap size={12} />
                <span>{candidate.parsed.education[0]}</span>
              </div>
            )}

            {/* ATS suggestions */}
            {candidate.atsResult?.suggestions && candidate.atsResult.suggestions.length > 0 && (
              <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">💡 AI Suggestions</p>
                <ul className="space-y-1">
                  {candidate.atsResult.suggestions.slice(0, 2).map((s, i) => (
                    <li key={i} className="text-xs text-secondary">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
