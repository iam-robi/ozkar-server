import { PrismaService } from 'nestjs-prisma';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ProofService {
  constructor(private prisma: PrismaService) {}

  generateProof() {
    return 'proof';
  }
}
