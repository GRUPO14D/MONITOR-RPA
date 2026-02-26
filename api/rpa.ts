/**
 * Proxy serverless (Vercel) → Railway back-server.
 * Repassa GET /api/status, GET /api/events e POST /events para o servidor central.
 * Requer env var SERVER_URL (ex: https://monitor-rpa-production.up.railway.app).
 */

const SERVER_URL = process.env.SERVER_URL;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ROUTE_MAP: Record<string, string> = {
  status: '/api/status',
  events: '/api/events',
};

async function proxy(url: string, init?: RequestInit): Promise<Response> {
  const upstream = await fetch(url, init);
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function GET(request: Request) {
  if (!SERVER_URL) {
    return new Response(
      JSON.stringify({ error: 'SERVER_URL not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const route = path ? ROUTE_MAP[path] : null;

  if (!route) {
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }

  // Forward query params (e.g. ?horas=24) excluding internal "path"
  const params = new URLSearchParams(url.searchParams);
  params.delete('path');
  const qs = params.toString();
  const target = `${SERVER_URL}${route}${qs ? `?${qs}` : ''}`;

  return proxy(target);
}

export async function POST(request: Request) {
  if (!SERVER_URL) {
    return new Response(
      JSON.stringify({ error: 'SERVER_URL not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }

  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (path === 'events') {
    const body = await request.text();
    return proxy(`${SERVER_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
