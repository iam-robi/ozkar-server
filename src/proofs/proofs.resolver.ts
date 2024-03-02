import { PrismaService } from 'nestjs-prisma';
import { Resolver, Query, Args, Subscription, Mutation } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { UseGuards, NotAcceptableException } from '@nestjs/common';
import { type WorkflowExecutionDescription } from '@temporalio/client';
import { Proof } from './models/proof.model.js';

import { CreateProofInput } from './dto/createProof.input.js';
import GraphQLJSON from 'graphql-type-json';
import { ProofService } from './proofs.service.js';
import { WorflowsStatusInput } from './dto/workflowStatus.input.js';
const pubSub = new PubSub();

import { SignatureInput } from '../common/dto/signature.input.js';
import 'crypto';
import { Signature } from 'o1js';

import { Client } from 'mina-signer';
import { sign } from 'crypto';

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
  //@Query(() => GraphQLJSON)
  @Mutation(() => GraphQLJSON)
  async requestProofs(
    @Args('proofRequests') proofRequests: CreateProofInput,
    @Args('signedData', { nullable: true }) signedData: SignatureInput,
  ): Promise<Array<string>> {
    const workflowIds = [];

    const serializedProvingRequests = JSON.stringify(
      proofRequests.proofRequests,
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(serializedProvingRequests);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const publicKey = signedData.signedData.publicKey;

    const verifyBody = {
      data: hashHex,
      publicKey: publicKey,
      signature: signedData.signedData.signature,
    };

    const signerClient = new Client({ network: 'mainnet' });
    const verifyResult = signerClient.verifyMessage(verifyBody);
    if (!verifyResult) {
      throw new NotAcceptableException({
        message: 'Signature verification failed',
      });
    }
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
