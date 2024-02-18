import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../common/pagination/pagination';
import { Proof } from './proof.model';

@ObjectType()
export class PostConnection extends PaginatedResponse(Proof) {}
