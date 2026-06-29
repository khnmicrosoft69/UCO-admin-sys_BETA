import type { APIRoute } from 'astro';
import sql from '../../utils/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ message: 'ID and Status are required', received: body }), { status: 400 });
    }

    await sql`
      UPDATE submissions SET status = ${status} WHERE id = ${id}
    `;

    return new Response(JSON.stringify({ message: 'Status updated successfully' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return new Response(JSON.stringify({ 
      message: 'Error updating status', 
      error: error.message,
      stack: error.stack
    }), { status: 500 });
  }
};

