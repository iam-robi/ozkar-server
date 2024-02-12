import { Module } from '@nestjs/common';
import { ProofsResolver } from './proofs.resolver';

@Module({
  imports: [],
  providers: [ProofsResolver],
})
export class ProofsModule {}
