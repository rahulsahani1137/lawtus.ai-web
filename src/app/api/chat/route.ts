export async function POST(req: Request) {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization') ?? ''

    const upstream = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/message`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
            body: JSON.stringify(body),
        },
    )

    if (!upstream.ok) {
        const err = await upstream.json().catch(() => ({}))
        return Response.json(
            { error: err.error ?? { message: 'Chat failed' } },
            { status: upstream.status },
        )
    }

    return new Response(upstream.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    })
}
