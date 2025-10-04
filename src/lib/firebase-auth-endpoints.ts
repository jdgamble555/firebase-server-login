import type {
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    FirebaseRestError,
    UserRecord
} from "./firebase-types";
import { exchangeCodeForGoogleIdToken } from "./google-oauth";
import { restFetch } from "./rest-fetch";


// Functions

function createAdminIdentityURL(project_id: string, name: string, accounts = true) {
    return `https://identitytoolkit.googleapis.com/v1/projects/${project_id}${accounts ? '/accounts' : ''}:${name}`;
}

function createIdentityURL(name: string) {
    return `https://identitytoolkit.googleapis.com/v1/accounts:${name}`;
}

export async function refreshFirebaseIdToken(
    refreshToken: string,
    key: string,
    fetchFn?: typeof globalThis.fetch
) {

    const url = `https://securetoken.googleapis.com/v1/token`;

    const { data, error } = await restFetch<FirebaseRefreshTokenResponse, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
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

export async function createAuthUri(
    redirect_uri: string,
    key: string,
    fetchFn?: typeof globalThis.fetch
) {

    const url = createIdentityURL('createAuthUri');

    const { data, error } = await restFetch<FirebaseCreateAuthUriResponse, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
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

async function signInWithIdp(
    googleIdToken: string,
    requestUri: string,
    key: string,
    fetchFn?: typeof globalThis.fetch
) {

    const url = createIdentityURL('signInWithIdp');

    const postBody = new URLSearchParams({
        id_token: googleIdToken,
        providerId: "google.com"
    }).toString();

    const { data, error } = await restFetch<FirebaseIdpSignInResponse, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
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


export async function getAccountInfoByUid(
    uid: string,
    token: string,
    project_id: string,
    fetchFn?: typeof globalThis.fetch
) {

    const url = createAdminIdentityURL(project_id, 'query');

    const { data, error } = await restFetch<UserRecord[], FirebaseRestError>(url, {
        global: { fetch: fetchFn },
        body: {
            filter: {
                localId: [uid]
            }
        },
        bearerToken: token
    });

    return {
        data: data?.length ? data[0] : null,
        error: error ? error.error : null
    };
}

export async function createSessionCookie(
    idToken: string,
    token: string,
    project_id: string,
    expiresIn: number = 60 * 60 * 24 * 14,
    fetchFn?: typeof globalThis.fetch
) {

    const url = createAdminIdentityURL(project_id, 'createSessionCookie', false);

    const { data, error } = await restFetch<{ sessionCookie: string }, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
        body: {
            idToken,
            validDuration: expiresIn.toString()
        },
        bearerToken: token
    });

    return {
        data: data?.sessionCookie || null,
        error: error ? error.error : null
    };
}

export async function getJWKs(fetchFn?: typeof globalThis.fetch) {

    const url = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

    const { data, error } = await restFetch<{ keys: (JsonWebKey & { kid: string })[] }, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
        method: "GET"
    });

    return {
        data: data?.keys || null,
        error: error ? error.error : null
    };
}

export async function getPublicKeys(fetchFn?: typeof globalThis.fetch) {

    const url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys';

    const { data, error } = await restFetch<Record<string, string>, FirebaseRestError>(url, {
        global: { fetch: fetchFn },
        method: "GET"
    });

    return {
        data,
        error: error ? error.error : null
    };
}

export async function exchangeCodeForFirebaseToken(
    code: string,
    redirect_uri: string,
    key: string,
    fetchFn?: typeof globalThis.fetch
) {

    const {
        data: uriData,
        error: uriError
    } = await exchangeCodeForGoogleIdToken(
        code,
        redirect_uri,
        fetchFn
    );

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
    } = await signInWithIdp(
        uriData.id_token,
        redirect_uri,
        key,
        fetchFn
    );

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


