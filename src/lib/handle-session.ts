import { getRequestEvent } from "$app/server"
import { refreshFirebaseIdToken } from "./firebase-admin";
import { decodeFirebaseToken, verifyFirebaseToken } from "./firebase-jwt";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60
} as Parameters<ReturnType<typeof getRequestEvent>['cookies']['set']>[2];

const FIREBASE_ID_TOKEN = 'firebase_id_token';
const FIREBASE_REFRESH_TOKEN = 'firebase_refresh_token';


export const storeSessionTokens = (
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

export const getSessionTokens = () => {

    const { cookies } = getRequestEvent();

    const id_token = cookies.get(FIREBASE_ID_TOKEN) || null;
    const refresh_token = cookies.get(FIREBASE_REFRESH_TOKEN) || null;

    return {
        id_token,
        refresh_token
    };

};

export const removeSessionTokens = () => {

    const { cookies } = getRequestEvent();

    // remove both cookies
    cookies.delete(FIREBASE_ID_TOKEN, COOKIE_OPTIONS);
    cookies.delete(FIREBASE_REFRESH_TOKEN, COOKIE_OPTIONS);
}


export const getVerifiedToken = async () => {

    const { id_token, refresh_token } = getSessionTokens();

    if (!id_token || !refresh_token) {
        removeSessionTokens();
        return {
            data: null,
            error: null
        };
    }

    const {
        error: verifyError,
        data
    } = await verifyFirebaseToken(id_token);

    if (verifyError) {

        // Auto refresh if expired
        if (verifyError.code === "ERR_JWT_EXPIRED") {

            const {
                data: refreshData,
                error: refreshError
            } = await refreshFirebaseIdToken(refresh_token);

            if (refreshError) {
                removeSessionTokens();
                return {
                    user: null,
                    error: refreshError
                };
            }

            const {
                id_token: new_id_token,
                refresh_token: new_refresh_token
            } = refreshData!;

            storeSessionTokens(new_id_token, new_refresh_token);

            const newTokenPayload = decodeFirebaseToken(new_id_token);

            return {
                data: newTokenPayload,
                error: null
            };
        }
        return {
            data: null,
            error: verifyError
        };
    }

    return {
        data,
        error: null
    };
};
