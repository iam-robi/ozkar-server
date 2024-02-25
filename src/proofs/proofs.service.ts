import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import {
  WorkflowClient,
  Connection,
  type WorkflowExecutionDescription,
} from '@temporalio/client';
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
      namespace: this.config.get<string>('temporal.namespace'),
    });

    const handle = await client.start('proveFhir', {
      args: [proofRequest],
      taskQueue: 'compute-proof-request',
      workflowId: 'fhir-' + crypto.randomUUID(),
    });

    return handle.workflowId;
  }

  async getWorkflowsStatus(
    workflowIds: Array<string>,
  ): Promise<Array<WorkflowExecutionDescription>> {
    const connection = await Connection.connect({
      address: this.config.get<string>('temporal.address'),
    });

    const client = new WorkflowClient({
      connection,
      namespace: this.config.get<string>('temporal.namespace'),
    });

    const workflowDescriptions: Array<WorkflowExecutionDescription> = [];

    for (const workflowId of workflowIds) {
      const handle = client.getHandle(String(workflowId));
      const workflowDescription = await handle.describe();
      workflowDescriptions.push(workflowDescription);
    }

    return workflowDescriptions;
  }

  formatQuery(query: string) {
    return query;
  }
}
