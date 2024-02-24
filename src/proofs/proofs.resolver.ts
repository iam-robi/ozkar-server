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
import {
  MerkleMapFactory,
  Verification,
  Backend,
  Query as ZkQuery,
  IPLD,
} from '../lib/src/index.js';
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
  async proveQuery(
    @Args('proofRequests') proofRequests: CreateProofInput,
  ): Promise<Array<string>> {
    const workflowIds = [];
    proofRequests.proofRequests.map((proofRequests) => {
      workflowIds.push(this.proofService.generateProof(proofRequests[0]));
    });

    return workflowIds;
  }
}
