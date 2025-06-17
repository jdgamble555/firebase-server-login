import { getRequestEvent } from "$app/server"
import { refreshFirebaseIdToken } from "./firebase-admin";
import { verifyFirebaseToken } from "./firebase-jwt";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60
} as Parameters<ReturnType<typeof getRequestEvent>['cookies']['set']>[2];

const FIREBASE_TOKEN = 'firebase_session';

type FirebaseSession = {
    id_token: string;
    refresh_token: string;
};

export const saveSession = (
    id_token: string,
    refresh_token: string
) => {

    const { cookies } = getRequestEvent();

    const stringData = JSON.stringify({
        id_token,
        refresh_token
    });

    cookies.set(
        FIREBASE_TOKEN,
        stringData,
        COOKIE_OPTIONS
    );
}

export const getSession = () => {

    const { cookies } = getRequestEvent();

    const stringData = cookies.get(FIREBASE_TOKEN) || null;

    if (!stringData) {
        return {
            data: null
        };
    }

    const data = JSON.parse(stringData) as FirebaseSession;

    return {
        data
    };
};

export const deleteSession = () => {

    const { cookies } = getRequestEvent();

    cookies.delete(FIREBASE_TOKEN, COOKIE_OPTIONS);
}


export const getVerifiedToken = async () => {

    const { data } = getSession();

    if (!data) {
        deleteSession();
        return {
            data: null,
            error: null
        };
    }

    const {
        error: verifyError,
        data: verifyData
    } = await verifyFirebaseToken(data.id_token);

    if (verifyError) {

        // Auto refresh if expired
        if (verifyError.code === "ERR_JWT_EXPIRED") {

            const {
                data: refreshData,
                error: refreshError
            } = await refreshFirebaseIdToken(data.refresh_token);

            if (refreshError) {
                deleteSession();
                return {
                    data: null,
                    error: refreshError
                };
            }

            if (!refreshData) {
                deleteSession();
                return {
                    data: null,
                    error: null
                };
            }
            saveSession(refreshData.id_token, refreshData.refresh_token);
            return {
                data: refreshData.id_token,                
                error: null
            };
        }
        return {
            data: null,
            error: verifyError
        };
    }

    if (!verifyData) {
        deleteSession();
        return {
            data: null,
            error: null
        };
    }

    return {
        data: data.id_token,
        error: null
    };
};
