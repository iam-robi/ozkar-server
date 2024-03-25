import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import {
  WorkflowClient,
  Connection,
  type WorkflowExecutionDescription,
  WorkflowExecutionStatusName,
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

    const results = [];
    for (const executionInfo of response.executions) {
      const workflowId = executionInfo.execution.workflowId;
      const runId = executionInfo.execution.runId;

      // Check if the execution status indicates that the workflow has completed
      // see WorkflowExecutionStatusName for status mapping. 2 == completed
      // if (executionInfo.status === 2) {
      //   // Adjust status check as needed
      //   const client = new WorkflowClient({
      //     connection: connection, // or however you instantiate your connection
      //     namespace: this.config.get<string>('temporal.namespace'),
      //   });

      //   const handle = client.getHandle(workflowId, runId);
      //   try {
      //     const result = await handle.result();
      //     results.push({
      //       workflowId: workflowId,
      //       runId: runId,
      //       result: result,
      //     });
      //   } catch (error) {
      //     console.error('Failed to fetch result for', workflowId, runId, error);
      //   }
      // }

      if (executionInfo.status === 2) {
        // Completed workflows
        const handle = client.getHandle(workflowId, runId);
        try {
          const result = await handle.result();
          results.push({
            workflowId: workflowId,
            runId: runId,
            status: 'COMPLETED',
            executionInfo: executionInfo,
            result: result,
          });
        } catch (error) {
          console.error('Failed to fetch result for', workflowId, runId, error);
        }
      } else if (executionInfo.status === 1) {
        // Running workflows
        // Include running workflows without result
        results.push({
          workflowId: workflowId,
          runId: runId,
          status: 'RUNNING',
          executionInfo: executionInfo,
          result: null, // Indicate no result for running workflows
        });
      }
    }

    console.log('Results:', results);

    return results; // Make sure to return the response
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

    const describeResp = await handle.describe();
    const clearAttributes = {};
    //console.log(describeResp.raw.workflowExecutionInfo);
    if (
      describeResp.raw.workflowExecutionInfo?.searchAttributes?.indexedFields
    ) {
      const indexedFields =
        describeResp.raw.workflowExecutionInfo.searchAttributes.indexedFields;

      for (const key in indexedFields) {
        const payload = indexedFields[key];
        // Ensure we're dealing with the expected structure
        if (payload.metadata && payload.data) {
          try {
            // Convert the Buffer to a string; assuming the encoding is 'json/plain' or similar and content is JSON
            const dataStr = payload.data.toString(); // Convert Buffer to string
            clearAttributes[key] = JSON.parse(dataStr);
          } catch (error) {
            console.error(
              'Error parsing search attribute for key:',
              key,
              '; Error:',
              error,
            );
            // If parsing fails, default to converting the Buffer to a string without parsing
            clearAttributes[key] = payload.data.toString();
          }
        } else {
          console.warn('Unexpected structure for search attribute:', key);
          clearAttributes[key] = payload;
        }
      }
    }

    const result = await handle.result();

    return {
      publicKey: clearAttributes['PublicKey'][0],
      resourceId: clearAttributes['ResourceId'][0],
      proofObject: result,
    };

    //TODO: add typing
    return result;
  }

  formatQuery(query: string) {
    return query;
  }
}
