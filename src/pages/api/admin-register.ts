import type { APIRoute } from 'astro';
import sql from '../../utils/db';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await sql`
      INSERT INTO admin_accounts (email, password_hash) VALUES (${email}, ${hashedPassword})
    `;

    return new Response(JSON.stringify({ message: 'Admin registered successfully' }), {
      status: 201,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ message: 'Error registering admin' }), { status: 500 });
  }
};

