// Add Workflow Definitions here.
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';

const { computeProof, computeFhirProof } = proxyActivities<typeof activities>({
  startToCloseTimeout: '45 minutes',
});
import { type ProofRequest } from './activities';
// import { ExecutionProof } from 'ozkar-zerkle/build/esm/lib/mina-backend';
/** A workflow that simply calls an activity */

export async function prove(proofRequest: ProofRequest): Promise<ProofRequest> {
  return await computeProof(proofRequest);
}

export async function proveFhir(proofRequest: ProofRequest): Promise<any> {
  return await computeFhirProof(proofRequest);
}
