import { Module } from '@nestjs/common';
import { ProofsResolver } from './proofs.resolver';
import { ProofService } from './proofs.service';

@Module({
  imports: [],
  providers: [ProofsResolver, ProofService],
})
export class ProofsModule {}
