import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../common/models/base.model';

@ObjectType()
export class Proof extends BaseModel {
  @Field(() => String, { nullable: true })
  workflowId: string;

  @Field(() => String, { nullable: true })
  queryComparator: string | null;

  @Field(() => String, { nullable: true })
  queryResourceType: string;

  @Field(() => String, { nullable: true })
  queryValue: string;

  @Field(() => String, { nullable: true })
  queryRaw: string;

  @Field(() => String, { nullable: true })
  publicKey: string;
}
