// src/pages/api/submissions/analytics.js
import sql from '../../utils/db';

export const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'summary'; // 'summary' or 'list'
    const yearFilter = url.searchParams.get('year');
    const monthFilter = url.searchParams.get('month'); // 1-indexed (1 = Jan, 12 = Dec)

    // Filter to isolate archived forms (Completed or Rejected)
    const archivedCondition = "status IN ('Completed', 'Rejected')";

    // --- MODE 1: GRANULAR TIME-BASED LIST DRILL-DOWN ---
    if (mode === 'list' && yearFilter) {
      let rows;
      if (monthFilter) {
        rows = await sql`
          SELECT * FROM submissions 
          WHERE ${sql.unsafe(archivedCondition)} 
            AND CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = ${parseInt(yearFilter)}
            AND CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) = ${parseInt(monthFilter)}
          ORDER BY created_at DESC
        `;
      } else {
        rows = await sql`
          SELECT * FROM submissions 
          WHERE ${sql.unsafe(archivedCondition)} 
            AND CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = ${parseInt(yearFilter)}
          ORDER BY created_at DESC
        `;
      }
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // --- MODE 2: FULL ANALYTICS AGGREGATIONS ---
    
    // 1. Total Submissions & Lifetime Metrics
    const totalRow = await sql`
      SELECT COUNT(*) as "totalLifetime" 
      FROM submissions 
      WHERE ${sql.unsafe(archivedCondition)}
    `;
    const totalLifetime = parseInt(totalRow[0].totalLifetime || 0);

    // 2. Average Monthly Baseline 
    // Finds distinct active months and divides total items to establish a true operational baseline
    const baselineRow = await sql`
      SELECT COUNT(DISTINCT TO_CHAR(created_at, 'YYYY-MM')) as "activeMonthsCount"
      FROM submissions
      WHERE ${sql.unsafe(archivedCondition)}
    `;
    const activeMonths = parseInt(baselineRow[0].activeMonthsCount || 1) || 1;
    const avgMonthlyBaseline = Math.round(totalLifetime / activeMonths);

    // 3. Line Chart Timelines (MoM / YoY groupings)
    const timelineRows = await sql`
      SELECT 
        CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) as yr, 
        CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) as mo,
        TO_CHAR(created_at, 'Mon YYYY') as label,
        COUNT(*) as count
      FROM submissions
      WHERE ${sql.unsafe(archivedCondition)}
      GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon YYYY')
      ORDER BY yr ASC, mo ASC
    `;

    // 4. Matrix Generation for Cyclical/Seasonal Heatmap (2023 - 2026)
    const heatmapRows = await sql`
      SELECT 
        CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) as mo,
        SUM(CASE WHEN CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = 2023 THEN 1 ELSE 0 END) as count_2023,
        SUM(CASE WHEN CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = 2024 THEN 1 ELSE 0 END) as count_2024,
        SUM(CASE WHEN CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = 2025 THEN 1 ELSE 0 END) as count_2025,
        SUM(CASE WHEN CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) = 2026 THEN 1 ELSE 0 END) as count_2026
      FROM submissions
      WHERE ${sql.unsafe(archivedCondition)}
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY mo ASC
    `;

    // Format matrix data into continuous row arrays mapped to 12 months (Jan-Dec)
    const heatmapMatrix = Array.from({ length: 12 }, (_, i) => [0, 0, 0, 0]); 
    heatmapRows.forEach(row => {
      const monthIdx = row.mo - 1;
      heatmapMatrix[monthIdx] = [
        parseInt(row.count_2023 || 0),
        parseInt(row.count_2024 || 0),
        parseInt(row.count_2025 || 0),
        parseInt(row.count_2026 || 0)
      ];
    });

    return new Response(JSON.stringify({
      totalLifetime,
      avgMonthlyBaseline,
      timeline: timelineRows,
      heatmapMatrix
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Analytics Engine Database Error:", error);
    return new Response(JSON.stringify({ error: "Internal Database Server Error" }), { status: 500 });
  }
};