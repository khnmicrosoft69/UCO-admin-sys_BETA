import type { APIRoute } from 'astro';
import crypto from 'crypto';
import sql from '../../utils/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    // Select only hash
    const rows = await sql`
      SELECT password_hash FROM admin_accounts WHERE email = ${email.trim()}
    `;
    const admin = rows[0];

    if (admin) {
      // Hash incoming password to compare
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      if (hashedPassword === admin.password_hash) {
          return new Response(JSON.stringify({ message: 'Login successful' }), {
            status: 200,
            headers: { 
              'content-type': 'application/json',
              'Set-Cookie': `session=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax` // Simplified session cookie
            }
          });
      }
    }
    
    return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Error processing login' }), { status: 500 });
  }
};

