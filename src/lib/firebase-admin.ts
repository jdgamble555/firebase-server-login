import { getRequestEvent } from "$app/server";
import { PRIVATE_GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import type {
    FirebaseConfig,
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    GoogleTokenResponse
} from "./firebase-types";
import { firebaseFetch, googleFetch } from "./rest-fetch";


const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseConfig;

const apiKey = firebase_config.apiKey;

const client_id = PUBLIC_GOOGLE_CLIENT_ID;
const client_secret = PRIVATE_GOOGLE_CLIENT_SECRET;
const client_redirect_uri = '/auth/callback';


const getRedirectUri = () => {

    const { url } = getRequestEvent();

    return url.origin + client_redirect_uri;
};


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

    return await googleFetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
    });
}

export async function createAuthUri(redirect_uri: string) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;

    const input = {
        continueUri: redirect_uri,
        providerId: "google.com"
    };

    return await firebaseFetch<FirebaseCreateAuthUriResponse>(url, input);
}

export async function signInWithIdp(googleIdToken: string) {

    const requestUri = getRedirectUri()

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;

    const input = {
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri,
        returnSecureToken: true
    };

    return await firebaseFetch<FirebaseIdpSignInResponse>(url, input);
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