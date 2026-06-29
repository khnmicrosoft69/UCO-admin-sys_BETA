import type { APIRoute } from 'astro';
import sql from '../../../utils/db';

export const prerender = false;

// ─── Ensure Table Exists ──────────────────────────────────────────────────────
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS team_calendar_events (
      id            SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      description   TEXT,
      date          DATE NOT NULL,
      time          VARCHAR(20),
      end_time      VARCHAR(20),
      type          VARCHAR(50) DEFAULT 'Internal',
      status        VARCHAR(50) DEFAULT 'Scheduled',
      color         VARCHAR(50) DEFAULT 'bg-indigo-500',
      created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// ─── GET – fetch events (optionally filter by month/year) ─────────────────────
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const year  = url.searchParams.get('year');

    await ensureTable();

    let rows;
    if (month && year) {
      rows = await sql`
        SELECT * FROM team_calendar_events 
        WHERE CAST(EXTRACT(MONTH FROM date) AS INTEGER) = ${parseInt(month)} 
          AND CAST(EXTRACT(YEAR FROM date) AS INTEGER) = ${parseInt(year)}
        ORDER BY date ASC, time ASC
      `;
    } else {
      rows = await sql`
        SELECT * FROM team_calendar_events 
        ORDER BY date ASC, time ASC
      `;
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/calendar/events error:', error);
    return new Response(JSON.stringify({ message: 'Error fetching events', error: error.message }), {
      status: 500,
    });
  }
};

// ─── POST – create a new event ────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, description, date, time, end_time, type, status, color } = body;

    if (!title || !date) {
      return new Response(JSON.stringify({ message: 'Title and date are required' }), { status: 400 });
    }

    await ensureTable();

    const insertResult = await sql`
      INSERT INTO team_calendar_events (title, description, date, time, end_time, type, status, color)
      VALUES (
        ${title},
        ${description || null},
        ${date},
        ${time || null},
        ${end_time || null},
        ${type || 'Internal'},
        ${status || 'Scheduled'},
        ${color || 'bg-indigo-500'}
      )
      RETURNING *
    `;

    return new Response(JSON.stringify(insertResult[0]), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('POST /api/calendar/events error:', error);
    return new Response(JSON.stringify({ message: 'Error creating event', error: error.message }), {
      status: 500,
    });
  }
};

// ─── PUT – update an existing event ──────────────────────────────────────────
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, title, description, date, time, end_time, type, status, color } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: 'Event ID is required' }), { status: 400 });
    }

    await ensureTable();

    const updateResult = await sql`
      UPDATE team_calendar_events
      SET title = ${title}, 
          description = ${description || null}, 
          date = ${date}, 
          time = ${time || null}, 
          end_time = ${end_time || null}, 
          type = ${type}, 
          status = ${status}, 
          color = ${color},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return new Response(JSON.stringify(updateResult[0]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('PUT /api/calendar/events error:', error);
    return new Response(JSON.stringify({ message: 'Error updating event', error: error.message }), {
      status: 500,
    });
  }
};

// ─── DELETE – remove an event ─────────────────────────────────────────────────
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id  = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ message: 'Event ID is required' }), { status: 400 });
    }

    await ensureTable();

    await sql`DELETE FROM team_calendar_events WHERE id = ${id}`;

    return new Response(JSON.stringify({ message: 'Event deleted successfully' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    console.error('DELETE /api/calendar/events error:', error);
    return new Response(JSON.stringify({ message: 'Error deleting event', error: error.message }), {
      status: 500,
    });
  }
};

