import { PrismaService } from 'nestjs-prisma';
import { Resolver, Query, Args, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

//import { UseGuards } from '@nestjs/common';
import { type WorkflowExecutionDescription } from '@temporalio/client';
import { Proof } from './models/proof.model.js';

import { CreateProofInput } from './dto/createProof.input.js';
import GraphQLJSON from 'graphql-type-json';
import { ProofService } from './proofs.service.js';
import { WorflowsStatusInput } from './dto/workflowStatus.input.js';
const pubSub = new PubSub();

@Resolver(() => Proof)
export class ProofsResolver {
  constructor(
    private prisma: PrismaService,
    private proofService: ProofService,
  ) {}

  @Subscription(() => Proof)
  proofCreated() {
    return pubSub.asyncIterator('proofCreated');
  }

  // @UseGuards(GqlAuthGuard)
  @Query(() => GraphQLJSON)
  async requestProofs(
    @Args('proofRequests') proofRequests: CreateProofInput,
  ): Promise<Array<string>> {
    const workflowIds = [];

    for (const proofRequest of proofRequests.proofRequests) {
      const workflowId = await this.proofService.generateProof(proofRequest);
      workflowIds.push(workflowId);
    }

    return workflowIds;
  }

  @Query(() => GraphQLJSON)
  async getWorflowStatus(
    @Args('workflowIds') workflowIds: WorflowsStatusInput,
  ): Promise<Array<WorkflowExecutionDescription>> {
    const workflowDescriptions = this.proofService.getWorkflowsStatus(
      workflowIds.workflowIds,
    );

    return workflowDescriptions;
  }
}
