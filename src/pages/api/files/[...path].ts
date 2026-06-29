import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export const GET: APIRoute = async ({ params }) => {
  const filePathParam = params.path;
  if (!filePathParam) return new Response('Missing path', { status: 400 });

  // Decode the path and normalize separators
  const decodedPath = decodeURIComponent(filePathParam).replace(/\\/g, path.sep);
  const filePath = path.join(process.cwd(), '..', decodedPath);

  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  return new Response(file, {
    status: 200,
    headers: { 
        'content-type': contentType,
        'Content-Length': file.length.toString()
    }
  });
};