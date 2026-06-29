import type { APIRoute } from 'astro';
import sql from '../../utils/db';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const office = url.searchParams.get('office');

    let rows;
    if (office) {
      rows = await sql`
        SELECT * FROM submissions 
        WHERE office_name = ${office} 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM submissions 
        ORDER BY created_at DESC
      `;
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new Response(JSON.stringify({ message: 'Error fetching submissions' }), { status: 500 });
  }
};

