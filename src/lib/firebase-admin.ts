import {
    apiKey,
    client_id,
    client_secret,
    getRedirectUri,
    projectId
} from "./firebase";
import type {
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseIdTokenPayload,
    FirebaseRefreshTokenResponse,
    GoogleTokenResponse
} from "./firebase-types";
import { firebaseFetch, googleFetch } from "./rest-fetch";
import { jwtVerify, createRemoteJWKSet } from 'jose';

// JWK Token from Firebase
const jwks = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

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

export async function exchangeCodeForGoogleIdToken(code: string) {

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

export async function verifyFirebaseToken(idToken: string) {

    try {
        const { payload } = await jwtVerify(idToken, jwks, {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };
    } catch (err) {
        console.error("Token verification failed:", err);
        return {
            error: err as Error,
            data: null
        }
    }
}


export async function createAuthUri(redirect_uri: string) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;

    return await firebaseFetch<FirebaseCreateAuthUriResponse>(url, {
        continueUri: redirect_uri,
        providerId: "google.com"
    });
}

export async function signInWithIdp(googleIdToken: string) {

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


