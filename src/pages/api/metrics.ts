import type { APIRoute } from 'astro';
import sql from '../../utils/db';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const office = url.searchParams.get('office');

    // 1. Get Metrics
    let totalRows, pendingRows, inProcessRows, completedRows, rejectedRows;
    if (office) {
      totalRows = await sql`SELECT COUNT(*)::int as total FROM submissions WHERE office_name = ${office}`;
      pendingRows = await sql`SELECT COUNT(*)::int as pending FROM submissions WHERE office_name = ${office} AND status = 'Pending'`; 
      inProcessRows = await sql`SELECT COUNT(*)::int as "inProcess" FROM submissions WHERE office_name = ${office} AND status = 'In-process'`;
      completedRows = await sql`SELECT COUNT(*)::int as completed FROM submissions WHERE office_name = ${office} AND status = 'Completed'`;
      rejectedRows = await sql`SELECT COUNT(*)::int as rejected FROM submissions WHERE office_name = ${office} AND status = 'Rejected'`;
    } else {
      totalRows = await sql`SELECT COUNT(*)::int as total FROM submissions`;
      pendingRows = await sql`SELECT COUNT(*)::int as pending FROM submissions WHERE status = 'Pending'`; 
      inProcessRows = await sql`SELECT COUNT(*)::int as "inProcess" FROM submissions WHERE status = 'In-process'`;
      completedRows = await sql`SELECT COUNT(*)::int as completed FROM submissions WHERE status = 'Completed'`;
      rejectedRows = await sql`SELECT COUNT(*)::int as rejected FROM submissions WHERE status = 'Rejected'`;
    }
    
    // 2. Get Velocity (Group by month)
    let velocityRows;
    if (office) {
      velocityRows = await sql`
        SELECT CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) as month, COUNT(*)::int as count 
        FROM submissions 
        WHERE office_name = ${office} AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY EXTRACT(MONTH FROM created_at)
      `;
    } else {
      velocityRows = await sql`
        SELECT CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) as month, COUNT(*)::int as count 
        FROM submissions 
        WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY EXTRACT(MONTH FROM created_at)
      `;
    }

    // 3. Get Request Type Distribution
    let requestTypeRows;
    if (office) {
      requestTypeRows = await sql`
        SELECT request_type, COUNT(*)::int as count 
        FROM submissions 
        WHERE office_name = ${office}
        GROUP BY request_type
      `;
    } else {
      requestTypeRows = await sql`
        SELECT request_type, COUNT(*)::int as count 
        FROM submissions 
        GROUP BY request_type
      `;
    }

    // 4. Get Service Type Distribution
    let serviceTypeRows;
    if (office) {
      serviceTypeRows = await sql`
        SELECT service, COUNT(*)::int as count 
        FROM submissions 
        WHERE office_name = ${office}
        GROUP BY service
      `;
    } else {
      serviceTypeRows = await sql`
        SELECT service, COUNT(*)::int as count 
        FROM submissions 
        GROUP BY service
      `;
    }

    const total = totalRows[0]?.total || 0;
    const pending = pendingRows[0]?.pending || 0;
    const inProcess = inProcessRows[0]?.inProcess || 0;
    const completed = completedRows[0]?.completed || 0;
    const rejected = rejectedRows[0]?.rejected || 0;

    return new Response(JSON.stringify({
        metrics: {
            total,
            pending,
            inProcess,
            completed,
            rejected
        },
        velocity: velocityRows || [],
        requestTypes: requestTypeRows || [],
        serviceTypes: serviceTypeRows || []
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return new Response(JSON.stringify({ message: 'Error fetching metrics' }), { status: 500 });
  }
};

