import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class WorflowsStatusInput {
  @Field(() => [String])
  @IsNotEmpty()
  workflowIds: string[];
}
