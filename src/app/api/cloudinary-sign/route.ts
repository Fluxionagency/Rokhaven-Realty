import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '4POCqehT_HOYdWrwoLG9MqdVFyE';
  const apiKey = process.env.CLOUDINARY_API_KEY || '684177344658937';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dz4lqehjv';

  const timestamp = Math.round(Date.now() / 1000);
  const folder = request.nextUrl.searchParams.get('folder') || 'rokhaven/videos';

  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  return NextResponse.json({ signature, api_key: apiKey, timestamp, cloud_name: cloudName, folder });
}
