import { handler } from './handler';

async function runLocal() {
  const result = await handler({}, {} as any, {} as any);
  console.log('Result:', result);
}

runLocal();