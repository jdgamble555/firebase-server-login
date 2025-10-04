import { getRequestEvent } from "$app/server";
import {
    client_id,
    client_redirect_uri,
    client_secret,
    DEFAULT_REDIRECT_PAGE,
    firebase_config
} from "./firebase";
import type {
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    GoogleTokenResponse
} from "./firebase-types";
import { firebaseFetch, googleFetch } from "./rest-fetch";

export const apiKey = firebase_config.apiKey;

export const getPathname = () => {

    const { request } = getRequestEvent();

    const referer = request.headers.get('referer');

    if (!referer) {
        return DEFAULT_REDIRECT_PAGE;
    }

    const url = new URL(referer);
    return url.searchParams.get("next") || DEFAULT_REDIRECT_PAGE;
}

export const getRedirectUri = () => {

    const { url } = getRequestEvent();

    return url.origin + client_redirect_uri;
};

// Functions

export function createGoogleOAuthLoginUrl() {

    const redirect_uri = getRedirectUri();
    const path = getPathname();

    const state = JSON.stringify({
        next: path
    });

    return new URL(
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id,
            redirect_uri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent",
            state
        }).toString()
    ).toString();
}

async function exchangeCodeForGoogleIdToken(code: string) {

    const redirect_uri = getRedirectUri();

    const url = 'https://oauth2.googleapis.com/token';

    return await googleFetch<GoogleTokenResponse>(url, {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
    });
}

export async function refreshFirebaseIdToken(refreshToken: string) {

    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    return await googleFetch<FirebaseRefreshTokenResponse>(url, {
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });
}

export async function createAuthUri(redirect_uri: string) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;

    return await firebaseFetch<FirebaseCreateAuthUriResponse>(url, {
        continueUri: redirect_uri,
        providerId: "google.com"
    });
}

async function signInWithIdp(googleIdToken: string) {

    const requestUri = getRedirectUri()

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;

    return await firebaseFetch<FirebaseIdpSignInResponse>(url, {
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri,
        returnSecureToken: true
    });
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


