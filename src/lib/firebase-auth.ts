import { getRequestEvent } from "$app/server";
import {
    client_id,
    client_redirect_uri,
    client_secret,
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


export const getRedirectUri = () => {

    const { url } = getRequestEvent();

    return url.origin + client_redirect_uri;
};

// Functions

export function createGoogleOAuthLoginUrl() {

    const redirect_uri = getRedirectUri();

    const loginUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    loginUrl.searchParams.set("client_id", client_id);
    loginUrl.searchParams.set("redirect_uri", redirect_uri);
    loginUrl.searchParams.set("response_type", "code");
    loginUrl.searchParams.set("scope", "openid email profile");
    loginUrl.searchParams.set("access_type", "offline");
    loginUrl.searchParams.set("prompt", "consent");

    return loginUrl.toString();
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


