import { decodeProtectedHeader, importPKCS8, importX509, jwtVerify, SignJWT } from "jose";
import {
    JWSSignatureVerificationFailed,
    JWTClaimValidationFailed,
    JWTExpired,
    JWTInvalid
} from "jose/errors";
import type { FirebaseIdTokenPayload, ServiceAccount } from "./firebase-types";
import { getJWKs, getPublicKeys } from "./firebase-auth-endpoints";

export async function verifySessionJWT(
    sessionCookie: string,
    projectId: string,
    fetchFn?: typeof globalThis.fetch
) {

    try {

        const { data, error } = await getPublicKeys(fetchFn);

        if (error) {
            return {
                data: null,
                error
            };
        }

        if (!data) {
            return {
                data: null,
                error: {
                    code: 500,
                    message: 'No public keys returned',
                    errors: []
                }
            };
        }

        const header = decodeProtectedHeader(sessionCookie);

        if (!header.kid || !data[header.kid]) {
            return {
                error: {
                    code: 500,
                    message: 'No KID found in token',
                    errors: []
                },
                data: null
            };
        }

        const certificate = data[header.kid];

        const publicKey = await importX509(certificate, 'RS256');


        const { payload } = await jwtVerify(sessionCookie, publicKey, {
            issuer: `https://session.firebase.google.com/${projectId}`,
            audience: projectId,
            algorithms: ['RS256']
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };

    } catch (err: unknown) {

        if (err instanceof JWTExpired ||
            err instanceof JWTInvalid ||
            err instanceof JWTClaimValidationFailed ||
            err instanceof JWSSignatureVerificationFailed) {
            return {
                error: err,
                data: null
            };
        }

        // Should never happen
        throw err;
    }
}


export async function verifyJWT(
    idToken: string,
    projectId: string,
    fetchFn?: typeof globalThis.fetch
) {

    try {

        const { kid } = decodeProtectedHeader(idToken);

        if (!kid) {
            return {
                error: {
                    code: 500,
                    message: 'No KID found in token',
                    errors: []
                },
                data: null
            };
        }

        const { data, error } = await getJWKs(fetchFn);

        if (error) {
            return {
                error,
                data: null
            };
        }

        if (!data || !data.length) {
            return {
                error: {
                    code: 500,
                    message: 'No JWKs found',
                    errors: []
                },
                data: null
            };
        }

        const jwk = data.find(key => key.kid === kid);
        if (!jwk) {
            return {
                error: {
                    code: 500,
                    message: 'No matching JWK found',
                    errors: []
                },
                data: null
            };
        }

        const { payload } = await jwtVerify(idToken, jwk, {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
            algorithms: ['RS256']
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };

    } catch (err: unknown) {

        if (err instanceof JWTExpired ||
            err instanceof JWTInvalid ||
            err instanceof JWTClaimValidationFailed ||
            err instanceof JWSSignatureVerificationFailed) {
            return {
                error: err,
                data: null
            };
        }

        // Should never happen
        throw err;
    }
}


export async function signJWT(
    serviceAccount: ServiceAccount
) {

    const { private_key, client_email } = serviceAccount;

    const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

    const SCOPES = [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/identitytoolkit",
        "https://www.googleapis.com/auth/devstorage.read_write"
    ] as const;

    const key = await importPKCS8(private_key, 'RS256');

    const token = await new SignJWT({ scope: SCOPES.join(' ') })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(client_email)
        .setSubject(client_email)
        .setAudience(OAUTH_TOKEN_URL)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(key);

    return token;
}