// Add Workflow Definitions here.
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';

const { computeProof } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});
import { type ProofRequest } from './activities';
/** A workflow that simply calls an activity */

export async function prove(proofRequest: ProofRequest): Promise<ProofRequest> {
  return await computeProof(proofRequest);
}
