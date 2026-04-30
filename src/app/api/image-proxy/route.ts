import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    ADMIN_TOKEN_STORAGE_NAME,
    MOBILE_FURIZON_AUTH_HEADER,
    TOKEN_STORAGE_NAME,
} from '@/lib/constants';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const incomingAuthorization = request.headers.get('authorization');
        const token = cookieStore.get(TOKEN_STORAGE_NAME)?.value;
        const adminToken = request.headers.get('furizon_admin') ?? cookieStore.get(ADMIN_TOKEN_STORAGE_NAME)?.value;

        const headers: Record<string, string> = {};

        if (incomingAuthorization) {
            headers['authorization'] = incomingAuthorization;
        } else if (token) {
            headers['authorization'] = `Bearer ${token}`;
        }

        if (adminToken) {
            headers['furizon_admin'] = adminToken;
        }

        if (MOBILE_FURIZON_AUTH_HEADER) {
            headers['furizonauth'] = MOBILE_FURIZON_AUTH_HEADER;
        }

        const response = await fetch(imageUrl, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch image: ${response.status}` },
                { status: response.status }
            );
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'private, no-store',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
