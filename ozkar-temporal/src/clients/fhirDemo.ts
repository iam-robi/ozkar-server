import { Connection, Client } from '@temporalio/client';
import { nanoid } from 'nanoid';
import { TASK_QUEUE_NAME } from '../shared';

// import your workflow
import { proveFhir } from '../workflows';
import { exampleProofRequest } from './example';

async function run() {
  // Connect to the default Server location
  const connection = await Connection.connect({ address: 'localhost:7233' });
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    namespace: 'ozkar-dev', // connects to 'default' namespace if not specified
  });

  const handle = await client.workflow.start(proveFhir, {
    taskQueue: TASK_QUEUE_NAME,
    // type inference works! args: [name: string]
    args: [exampleProofRequest],
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: 'workflow-' + nanoid(),
  });
  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
