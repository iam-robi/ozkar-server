import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import {
  WorkflowClient,
  Connection,
  type WorkflowExecutionDescription,
} from '@temporalio/client';
import { ConfigService } from '@nestjs/config';
import { PublicKey } from 'o1js';

@Injectable()
export class ProofService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async generateProof(
    proofRequest: any,
    publicKey: PublicKey,
    resourceId: string,
  ) {
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
      workflowId:
        'fhir_' +
        // publicKey.toBase58().toString() +
        // '_' +
        // resourceId +
        // '_' +
        crypto.randomUUID(),
      searchAttributes: {
        ResourceId: [resourceId],
        PublicKey: [publicKey.toBase58().toString()],
        // customSearchAttributes: {
        //   ResourceId: resourceId,
        //   publicKey: publicKey.toBase58().toString(),
        // },
      },
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

  async getWorkflowsByPublicKey(
    publicKey: string,
    status = '',
    resourceId = '',
  ) {
    const connection = await Connection.connect({
      address: this.config.get<string>('temporal.address'),
    });
    const client = new WorkflowClient({
      connection,
      namespace: this.config.get<string>('temporal.namespace'),
    });

    // Construct the query with mandatory publicKey and status
    let query = `PublicKey = "${publicKey}"`;

    if (status !== null && status !== undefined && status !== '') {
      query += ` AND ExecutionStatus = "${status}"`;
    }

    // Append resourceId to the query if it's provided
    if (resourceId !== null && resourceId !== undefined && resourceId !== '') {
      query += ` AND ResourceId = "${resourceId}"`;
    }

    const response = await connection.workflowService.listWorkflowExecutions({
      namespace: this.config.get<string>('temporal.namespace'), // Ensure namespace is passed here if required
      query: query,
    });

    return response; // Make sure to return the response
  }

  async getResultProof(workflowId: string) {
    const connection = await Connection.connect({
      address: this.config.get<string>('temporal.address'),
    });

    const client = new WorkflowClient({
      connection,
      namespace: this.config.get<string>('temporal.namespace'),
    });

    const handle = client.getHandle(workflowId);

    const result = await handle.result();
    console.log(result);
    //TODO: add typing
    return result;
  }

  formatQuery(query: string) {
    return query;
  }
}
