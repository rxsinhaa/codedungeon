import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { loginId, password } = await request.json();

        const validId = process.env.ADMIN_LOGIN_ID;
        const validPassword = process.env.ADMIN_LOGIN_PASSWORD;

        if (!validId || !validPassword) {
            return NextResponse.json({ success: false, error: 'Admin credentials not configured on server.' }, { status: 500 });
        }

        if (loginId === validId && password === validPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
