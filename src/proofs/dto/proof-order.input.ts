import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../common/order/order';

export enum ProofOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  published = 'published',
  title = 'title',
  content = 'content',
}

registerEnumType(ProofOrderField, {
  name: 'ProofOrderField',
  description: 'Properties by which Proof connections can be ordered.',
});

@InputType()
export class ProofOrder extends Order {
  @Field(() => ProofOrderField)
  field: ProofOrderField;
}
