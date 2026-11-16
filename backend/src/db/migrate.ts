import { connectDB, mongoose } from './connection.js';
import * as models from './models/index.js';

console.log('MongoDB migration: syncing indexes for all models...');
await connectDB();
for (const [name, model] of Object.entries(models)) {
  if (typeof (model as any).syncIndexes === 'function') {
    await (model as any).syncIndexes();
  }
}
await mongoose.disconnect();
console.log('MongoDB index synchronisation complete.');
