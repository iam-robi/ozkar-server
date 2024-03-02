import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

@InputType()
export class SignatureInput {
  @Field(() => GraphQLJSON, { nullable: true })
  signedData?: SignedData;
}
