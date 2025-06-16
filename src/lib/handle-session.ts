import { getRequestEvent } from "$app/server"

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60
} as Parameters<ReturnType<typeof getRequestEvent>['cookies']['set']>[2];

const FIREBASE_ID_TOKEN = 'firebase_id_token';
const FIREBASE_REFRESH_TOKEN = 'firebase_refresh_token';


export const storeToken = (
    token_id: string,
    refresh_token: string
) => {

    const { cookies } = getRequestEvent();

    // set both cookies
    cookies.set(
        FIREBASE_ID_TOKEN,
        token_id,
        COOKIE_OPTIONS
    );
    
    cookies.set(
        FIREBASE_REFRESH_TOKEN,
        refresh_token,
        COOKIE_OPTIONS
    );
}

export const logout = () => {
    
    const { cookies } = getRequestEvent();

    // remove both cookies
    cookies.delete(FIREBASE_ID_TOKEN, COOKIE_OPTIONS);
    cookies.delete(FIREBASE_REFRESH_TOKEN, COOKIE_OPTIONS);
}

