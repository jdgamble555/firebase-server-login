import { getRequestEvent } from "$app/server";
import { firebase_config } from "./firebase";
import type {
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    FirebaseRestError
} from "./firebase-types";
import { exchangeCodeForGoogleIdToken } from "./google-oauth";
import { restFetch } from "./rest-fetch";
import { getRedirectUri } from "./svelte-helpers";

export const key = firebase_config.apiKey;


// Functions

function createIdentityURL(name: string) {
    return `https://identitytoolkit.googleapis.com/v1/accounts:${name}`;
}

export async function refreshFirebaseIdToken(refreshToken: string) {

    const { fetch } = getRequestEvent();

    const url = `https://securetoken.googleapis.com/v1/token`;

    const { data, error } = await restFetch<FirebaseRefreshTokenResponse, FirebaseRestError>(url, {
        global: { fetch },
        body: {
            grant_type: "refresh_token",
            refresh_token: refreshToken
        },
        params: {
            key
        },
        form: true
    });

    return {
        data,
        error: error ? error.error : null
    };
}

export async function createAuthUri(redirect_uri: string) {

    const { fetch } = getRequestEvent();

    const url = createIdentityURL('createAuthUri');

    const { data, error } = await restFetch<FirebaseCreateAuthUriResponse, FirebaseRestError>(url, {
        global: { fetch },
        body: {
            continueUri: redirect_uri,
            providerId: "google.com"
        },
        params: {
            key
        }
    });

    return {
        data,
        error: error ? error.error : null
    };
}

async function signInWithIdp(googleIdToken: string) {

    const { fetch } = getRequestEvent();

    const requestUri = getRedirectUri()

    const url = createIdentityURL('signInWithIdp');

    const postBody = new URLSearchParams({
        id_token: googleIdToken,
        providerId: "google.com"
    }).toString();

    const { data, error } = await restFetch<FirebaseIdpSignInResponse, FirebaseRestError>(url, {
        global: { fetch },
        body: {
            postBody,
            requestUri,
            returnSecureToken: true
        },
        params: {
            key
        }
    });

    return {
        data,
        error: error ? error.error : null
    };
}

export async function exchangeCodeForFirebaseToken(code: string) {

    const {
        data: uriData,
        error: uriError
    } = await exchangeCodeForGoogleIdToken(code);

    if (uriError) {
        return {
            data: null,
            error: uriError
        };
    }

    if (!uriData) {
        return {
            data: null,
            error: null
        };
    }

    const {
        data: signInData,
        error: signInError
    } = await signInWithIdp(uriData.id_token);

    if (signInError) {
        return {
            data: null,
            error: signInError
        };
    }

    if (!signInData) {
        return {
            data: null,
            error: null
        };
    }

    return {
        data: signInData,
        error: null
    };
}


