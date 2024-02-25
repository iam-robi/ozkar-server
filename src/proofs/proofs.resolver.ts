import { PrismaService } from 'nestjs-prisma';
import {
  Resolver,
  Query,
  Parent,
  Args,
  ResolveField,
  Subscription,
  Mutation,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { UseGuards } from '@nestjs/common';

import { Proof } from './models/proof.model.js';

import { CreateProofInput } from './dto/createProof.input.js';
import GraphQLJSON from 'graphql-type-json';
import { ProofService } from './proofs.service.js';

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
}
