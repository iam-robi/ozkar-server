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

import { Post } from './models/post.model';

const pubSub = new PubSub();

@Resolver(() => Post)
export class ProofsResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => Post)
  proofCreated() {
    return pubSub.asyncIterator('proofCreated');
  }

  // @UseGuards(GqlAuthGuard)
  @Query(() => String)
  async proveQuery(@Args('name') name: string): Promise<string> {
    const map = MerkleMapFactory.fromLinearModel(
      IPLD.LinearModel.fromJS({
        a: 10,
        b: 20,
      }),
    );

    // Incoming public stuff
    const q = ZkQuery.parse({
      '/a': { $eq: 10 },
      '/b': { $ge: 20 },
    });

    console.time('compile');
    const backend = await Backend.compile();
    console.timeEnd('compile');

    console.time('execute.0');
    const proofE = await backend.proveQuery(q).run(map);
    console.timeEnd('execute.0');
    console.log(
      'p.0',
      proofE.publicOutput.trace.toString(),
      proofE.publicOutput.isSatisfied.toString(),
      proofE.publicInput.given.toString(),
      proofE.publicInput.root.toString(),
    );

    console.time('execute.1');
    const proof = await backend.execute(map, q);
    const verification = await Verification.check(q, proof);
    console.timeEnd('execute.1');
    console.log('a', proof, verification);
    console.log('q', q);
    console.log(map);
    pubSub.publish('postCreated', { proofCreated: 'proof' });

    return `Hello ${name}!`;
  }
}
