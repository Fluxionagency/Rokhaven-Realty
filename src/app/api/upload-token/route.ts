import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { fileName, contentType, folder } = await request.json();

  const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${folder || 'videos'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from('property-media')
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('property-media')
    .getPublicUrl(path);

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl });
}
