import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        const blob = await response.blob();

        // Lấy content type từ response gốc
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': 'inline',
            },
        });
    } catch (error) {
        console.error('Error proxying file:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file' },
            { status: 500 }
        );
    }
} 