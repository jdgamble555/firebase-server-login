import { deleteSession, getVerifiedToken, saveSession } from "./firebase-session";
import { exchangeCodeForFirebaseToken } from "./firebase-auth-endpoints";
import { firebase_config, firebaseClient, firebaseServer } from "./firebase";
import { getRedirectUri } from "./svelte-helpers";
import { getRequestEvent } from "$app/server";

export const getFirebaseServer = async () => {

    const {
        data: authIdToken,
        error: verifyError
    } = await getVerifiedToken();

    if (verifyError) {

        const { db } = await firebaseClient();

        return {
            data: {
                db,
                auth: null
            },
            error: verifyError
        };
    }

    if (!authIdToken) {

        const { db } = await firebaseClient();

        return {
            error: null,
            data: {
                db,
                auth: null
            }
        };
    }

    // Login with the token

    const { db, auth } = await firebaseServer(authIdToken);

    if (auth.currentUser === null) {
        return {
            error: new Error('Invalid Token'),
            data: {
                db,
                auth: null
            }
        };
    }

    return {
        error: null,
        data: {
            db,
            auth
        }
    };
};

export const logout = () => deleteSession();

export const loginWithCode = async (code: string) => {

    const { fetch } = getRequestEvent();

    const redirect_uri = getRedirectUri();

    const {
        data: exchangeData,
        error: exchangeError
    } = await exchangeCodeForFirebaseToken(
        code,
        redirect_uri,
        firebase_config.apiKey,
        fetch
    );



    if (exchangeError) {
        return {
            error: exchangeError
        };
    }

    if (!exchangeData) {
        return {
            error: new Error('No exchange data!')
        };
    }

    saveSession(
        exchangeData.idToken,
        exchangeData.refreshToken
    );

    return {
        error: null
    };
};

/*
export const x = async () => {

    const token = await data.auth.currentUser.getIdToken();

    const { data: sessionCookie, error: sessionError } = await auth.createSessionCookie(
        token,
        { expiresIn: 60 * 60 * 24 * 5 * 1000 }
    );

    if (sessionError) {
        return {
            error: sessionError
        };
    }

    if (!sessionCookie) {
        return {
            error: new Error('No session cookie returned')
        };
    }

    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);

    console.log(decodedIdToken);


};
*/