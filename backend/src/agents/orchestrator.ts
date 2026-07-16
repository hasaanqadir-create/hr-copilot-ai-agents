/**
 * Lightweight Manager Agent orchestration.
 *
 * This is a deliberately simple, dependency-free state machine instead of a
 * heavy framework like LangGraph. Each "agent" is just an async function
 * that receives the current pipeline context and returns a partial update.
 * The orchestrator (`runPipeline`) calls them in sequence, persisting state
 * between steps so the pipeline can pause/resume (e.g. waiting for an HR
 * action) and so failures in one agent don't crash the whole run.
 *
 * Swap-in path to LangGraph.js later: each `AgentStep` below maps 1:1 to a
 * LangGraph node; `runPipeline`'s sequential loop maps to a linear graph.
 */

export type PipelineStage =
  | 'intake'
  | 'ats_scoring'
  | 'job_matching'
  | 'ranking'
  | 'interview_generation'
  | 'scheduling'
  | 'email'
  | 'offer'
  | 'analytics'
  | 'done';

export interface PipelineContext {
  applicationId: string;
  candidateId: string;
  jobId?: string;
  stage: PipelineStage;
  data: Record<string, unknown>;
  errors: { stage: PipelineStage; message: string; at: Date }[];
}

export interface AgentStep {
  stage: PipelineStage;
  /** Human-readable name shown in logs/dashboard */
  name: string;
  run: (ctx: PipelineContext) => Promise<Partial<PipelineContext>>;
  /** Decide the next stage given the (possibly updated) context. Defaults to next array index. */
  next?: (ctx: PipelineContext) => PipelineStage;
}

export class PipelineError extends Error {
  constructor(public stage: PipelineStage, message: string) {
    super(message);
  }
}

/**
 * Runs registered agent steps in order starting from ctx.stage, mutating and
 * returning the context. Stops on 'done' or if a step throws (the error is
 * recorded in ctx.errors so the pipeline can be inspected/resumed later).
 */
export async function runPipeline(
  steps: AgentStep[],
  initialContext: PipelineContext
): Promise<PipelineContext> {
  let ctx = { ...initialContext };

  while (ctx.stage !== 'done') {
    const stepIndex = steps.findIndex((s) => s.stage === ctx.stage);
    if (stepIndex === -1) {
      throw new PipelineError(ctx.stage, `No agent registered for stage "${ctx.stage}"`);
    }
    const step = steps[stepIndex];

    try {
      console.log(`[manager-agent] running step: ${step.name} (${step.stage})`);
      const update = await step.run(ctx);
      const explicitNextStage = update.stage;
      ctx = { ...ctx, ...update, data: { ...ctx.data, ...(update.data ?? {}) } };

      // If run() explicitly set ctx.stage (e.g. to short-circuit to 'done'),
      // that takes priority over the step's static next() callback.
      const nextStage = explicitNextStage ?? (step.next ? step.next(ctx) : steps[stepIndex + 1]?.stage ?? 'done');
      ctx.stage = nextStage;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.errors.push({ stage: step.stage, message, at: new Date() });
      console.error(`[manager-agent] step "${step.name}" failed:`, message);
      // Stop the pipeline on failure rather than silently skipping — HR can
      // inspect ctx.errors and resume manually via the API.
      break;
    }
  }

  return ctx;
}

export function createInitialContext(args: {
  applicationId: string;
  candidateId: string;
  jobId?: string;
  startStage?: PipelineStage;
}): PipelineContext {
  return {
    applicationId: args.applicationId,
    candidateId: args.candidateId,
    jobId: args.jobId,
    stage: args.startStage ?? 'intake',
    data: {},
    errors: [],
  };
}
