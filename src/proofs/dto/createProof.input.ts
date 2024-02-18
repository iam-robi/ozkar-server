import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { Resource as FhirResource } from '@medplum/fhirtypes';
import GraphQLJSON from 'graphql-type-json';

export type RawQueryObject = {
  [key: string]: ComparisonObject;
};

export type ComparisonOperator = '$eq' | '$gt' | '$ge' | '$lt' | '$le' | '$ne';

type ComparisonObject = {
  [key in ComparisonOperator]?: string | number;
};

type ProofRequest = {
  query: RawQueryObject;
  resource: FhirResource;
};

@InputType()
export class CreateProofInput {
  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  proofRequests: ProofRequest[];
}
