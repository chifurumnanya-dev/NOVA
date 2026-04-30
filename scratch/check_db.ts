import { db } from './packages/db/src';
import { facilities } from './packages/db/src/schema';
import { sql } from 'drizzle-orm';

async function check() {
  const result = await db.select({
    type: facilities.facilityType,
    count: sql<number>`count(*)`
  })
  .from(facilities)
  .groupBy(facilities.facilityType);
  
  console.log('Facility counts in DB:');
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
