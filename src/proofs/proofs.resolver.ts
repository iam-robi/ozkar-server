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

import { SignatureInput } from '../common/dto/signature.input';
import 'crypto';

import { Client } from 'mina-signer';
import { PublicKey } from 'o1js';
import { hash } from 'bcrypt';
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

    const publicKey = PublicKey.fromBase58(signedData.signedData.publicKey);

    const verifyBody = {
      data: hashHex,
      publicKey: publicKey.toBase58().toString(),
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
      const workflowId = await this.proofService.generateProof(
        proofRequest,
        publicKey,
        proofRequest.resource.id,
      );
      const newProofMetadata = this.prisma.proof.create({
        data: {
          workflowId: workflowId as string,
          queryComparator: proofRequest.query.comparator as string,
          queryResourceType: proofRequest.resource.resourceType as string,
          queryValue: proofRequest.query.value as string,
          queryRaw: JSON.stringify(proofRequest.query) as string,
          publicKey: publicKey.toBase58().toString(),
        },
      });
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

  @Query(() => GraphQLJSON)
  async getUserWorkflows(
    @Args('publicKey') publicKey: string,
    @Args('status') status: string, // Make status mandatory
    @Args('resourceIds', { type: () => [String], nullable: 'itemsAndList' })
    resourceIds: string[],
  ): Promise<any> {
    // Now, pass both status and optionally resourceId to the service function
    const selectedWorkflows = [];

    for (const resourceId of resourceIds) {
      const workflows = await this.proofService.getWorkflowsByPublicKey(
        publicKey,
        status,
        resourceId,
      );
      const workflowData = { resourceId, publicKey, workflows };
      selectedWorkflows.push(workflowData);
    }

    return selectedWorkflows;
  }

  @Query(() => GraphQLJSON)
  async getProofsResults(
    @Args('signature') signature: string,
    @Args('workflowIds', { type: () => [String], nullable: 'itemsAndList' })
    workflowIds: string[], // Make status mandatory
  ): Promise<any> {
    const proofs = [];

    for (const workflowId of workflowIds) {
      try {
        const resultProof = await this.proofService.getResultProof(workflowId);
        if (!resultProof) {
          // Handle the case where no result is found; decide if you want to throw an error or return a default value
          throw new Error('No result found for the provided workflowId.');
        }
        proofs.push(resultProof);
      } catch (error) {
        // Log the error or handle it as needed
        console.error(error);
        throw new Error('Error retrieving proof result.');
      }
    }
    return proofs;
  }
}
