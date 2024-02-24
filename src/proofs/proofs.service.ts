import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import { WorkflowClient, Connection } from '@temporalio/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProofService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async generateProof(proofRequest: any) {
    const connection = await Connection.connect({
      address: this.config.get<string>('temporal.address'),
    });

    const client = new WorkflowClient({
      connection,
      namespace: 'default',
    });

    const handle = await client.start('fhirProof', {
      args: [proofRequest],
      taskQueue: 'fhir:dev',
      workflowId: 'fhir-' + crypto.randomUUID(),
    });

    console.log('handle', handle);

    return handle.workflowId;
  }

  formatQuery(query: string) {
    return query;
  }
}
