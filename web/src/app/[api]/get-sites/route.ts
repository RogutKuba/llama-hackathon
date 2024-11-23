import { db } from '@/db/db';
import { siteTable } from '@/db/schema/site.db';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (_: NextRequest) => {
  // Fetch projects for the user
  const sites = await db.select().from(siteTable);

  // Return the projects
  return NextResponse.json(sites);
};
