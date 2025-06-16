import { getRequestEvent } from "$app/server"

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60
} as Parameters<ReturnType<typeof getRequestEvent>['cookies']['set']>[2];


export const storeToken = (
    token_id: string,
    refresh_token: string
) => {

    const { cookies } = getRequestEvent();

    // set both cookies
    cookies.set('firebase_id_token', token_id, COOKIE_OPTIONS);
    cookies.set('firebase_refresh_token', refresh_token, COOKIE_OPTIONS);
}