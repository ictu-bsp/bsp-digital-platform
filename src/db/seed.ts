// add seed in here for mock data
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from './schema';
import * as dotenv from 'dotenv';

// Load environmental parameters manually for isolated script execution
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL missing from .env.local configuration file.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('🌱 Generating uniform local testing data inside Docker container...');

  // Reset existing table rows to clear previous experiments
  await db.delete(users);

  // Insert mock records that both Frontend and Backend specialists can use
  await db.insert(users).values([
    {
      email: 'test.scout1@bsp.ph',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      birthdate: '2012-05-15',
      council: 'Manila Council',
      paymentStatus: 'paid',
      verificationStatus: 'active',
      registrationYears: 1,
    },
    {
      email: 'test.scout2@bsp.ph',
      firstName: 'Maria',
      lastName: 'Clara',
      birthdate: '2010-11-23',
      council: 'Cebu Council',
      paymentStatus: 'awaiting_payment',
      verificationStatus: 'unverified',
      registrationYears: 2,
    }
  ]);

  console.log('✅ Local Docker database successfully populated with matching baseline records.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Data generation failed:', err);
  process.exit(1);
});