import { db } from '@/db/db';
import { siteTable } from '@/db/schema/site.db';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export const GET = async (_: NextApiRequest, res: NextApiResponse) => {
  // Fetch projects for the user
  const sites = await db.select().from(siteTable);

  // Return the projects
  return NextResponse.json(sites);
};
