import { getRequestEvent } from "$app/server";
import type { FirebaseRestError, GoogleTokenResponse } from "./firebase-types";
import { restFetch } from "./rest-fetch";
import { getPathname, getRedirectUri } from "./svelte-helpers";
import { client_id, client_secret } from "./firebase";

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

export async function exchangeCodeForGoogleIdToken(code: string) {

    const { fetch } = getRequestEvent();

    const redirect_uri = getRedirectUri();

    const url = 'https://oauth2.googleapis.com/token';

    const { data, error } = await restFetch<GoogleTokenResponse, FirebaseRestError>(url, {
        global: { fetch },
        body: {
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: "authorization_code"
        },
        form: true
    });

    return {
        data,
        error: error ? error.error : null
    };
}