'use server'

import { cookies } from 'next/headers'

export async function setRefreshTokenAction(token: string) {
    ; (await cookies()).set('lawtus_refresh', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    })
}

export async function clearRefreshTokenAction() {
    ; (await cookies()).delete('lawtus_refresh')
}
