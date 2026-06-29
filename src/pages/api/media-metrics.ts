import type { APIRoute } from 'astro';
import sql from '../../utils/db';
import fs from 'fs';
import path from 'path';

export const prerender = false;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filename: string, defaultType: string): number {
  try {
    const cleanFilename = filename.split('?')[0];
    const pathsToTry = [
      path.join(process.cwd(), 'uploads', cleanFilename),
      path.join(process.cwd(), '..', 'uploads', cleanFilename),
      path.join(process.cwd(), 'public', 'uploads', cleanFilename)
    ];

    for (const filePath of pathsToTry) {
      if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).size;
      }
    }
  } catch {}

  const fallbackSizes: Record<string, number> = {
    'Image': 2 * 1024 * 1024,
    'Video': 15 * 1024 * 1024,
    'Audio': 4 * 1024 * 1024,
    'Document': 1.2 * 1024 * 1024,
    'Others': 512 * 1024
  };
  return fallbackSizes[defaultType] || 0;
}

export const GET: APIRoute = async () => {
  try {
    // 1. SELECT * safely extracts every column to see if your file field uses a custom name
    const rows = await sql`
      SELECT * FROM submissions 
      ORDER BY created_at DESC
    `;

    // DEBUG LOG: Look at your terminal console! This will log the actual keys available in your database rows.
    if (rows.length > 0) {
      console.log("DATABASE COLUMNS DETECTED:", Object.keys(rows[0]));
      console.log("FIRST ROW SAMPLE DATA:", rows[0]);
    } else {
      console.log("DATABASE WARNING: Submissions table is completely empty!");
    }

    const allFiles: any[] = [];
    let totalBytes = 0;
    let imagesCount = 0;
    let videosCount = 0;
    let audioCount = 0;
    let documentsCount = 0; 
    let othersCount = 0;

    const uploadVelocity = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    for (const row of rows as any[]) {
      const date = new Date(row.created_at || new Date());
      const monthIdx = date.getMonth(); 
      const dateYear = date.getFullYear();
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Loop through every field value in the record row dynamically
      Object.entries(row).forEach(([columnName, fileField]) => {
        if (!fileField || typeof fileField !== 'string' || fileField.trim() === '') return;
        
        const lowerField = fileField.toLowerCase();
        
        // Skip standard non-file submission tracking columns
        if (['id', 'office_name', 'created_at', 'updated_at', 'status', 'user_id', 'email', 'name', 'remarks', 'description'].includes(columnName.toLowerCase())) {
          return;
        }

        // Check if string structure indicates a file or storage reference path
        const hasExtension = /\.(jpg|jpeg|png|webp|gif|mp4|mov|avi|mkv|mp3|wav|ogg|pdf|docx|doc|txt|xls|xlsx|csv)(\?|$)/i.test(lowerField);
        const isUrl = fileField.startsWith('http');
        
        if (!hasExtension && !isUrl) return;

        let typeStr = 'Others';
        if (/\.(pdf|docx|doc|txt|xls|xlsx|csv)(\?|$)/i.test(lowerField)) {
          typeStr = 'Document';
        } else if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(lowerField)) {
          typeStr = 'Image';
        } else if (/\.(mp4|mov|avi|mkv)(\?|$)/i.test(lowerField)) {
          typeStr = 'Video';
        } else if (/\.(mp3|wav|ogg)(\?|$)/i.test(lowerField)) {
          typeStr = 'Audio';
        }

        const size = getFileSize(fileField, typeStr);
        totalBytes += size;
        
        if (typeStr === 'Image') imagesCount++;
        else if (typeStr === 'Video') videosCount++;
        else if (typeStr === 'Audio') audioCount++;
        else if (typeStr === 'Document') documentsCount++;
        else othersCount++;
        
        if (dateYear === currentYear) uploadVelocity[monthIdx]++;
        
        let displayName = fileField;
        try {
          const parts = fileField.split('?')[0].split('/');
          displayName = parts[parts.length - 1] || fileField;
        } catch {}

        allFiles.push({
          name: displayName,
          type: typeStr,
          size,
          formattedSize: formatBytes(size),
          office: row.office_name || 'Unknown Office',
          date: dateStr,
          path: isUrl ? fileField : `uploads/${fileField}`,
          folder: isUrl ? 'drive' : 'uploads',
        });
      });
    }

    const totalFiles = allFiles.length;
    const storageUsed = formatBytes(totalBytes);

    const fileTypeDistribution = {
      labels: ["Images", "Videos", "Documents", "Audio", "Others"],
      series: totalFiles > 0
        ? [
            Math.round((imagesCount / totalFiles) * 100),
            Math.round((videosCount / totalFiles) * 100),
            Math.round((documentsCount / totalFiles) * 100),
            Math.round((audioCount / totalFiles) * 100),
            Math.round((othersCount / totalFiles) * 100),
          ]
        : [0, 0, 0, 0, 0],
    };

    return new Response(
      JSON.stringify({
        metrics: {
          totalFiles,
          storageUsed,
          imagesCount,
          videosCount,
          documentsCount, 
          audioCount,
        },
        uploadVelocity,
        fileTypeDistribution,
        recentUploads: allFiles.slice(0, 20),
        allFiles,
      }),
      {
        status: 200,
        headers: { 
          'content-type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        },
      }
    );
  } catch (error) {
    console.error('Error fetching media metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};