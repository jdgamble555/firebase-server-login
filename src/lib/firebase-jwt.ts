import { decodeProtectedHeader, importJWK, jwtVerify } from "jose";
import { firebase_config } from "./firebase";
import type { FirebaseIdTokenPayload } from "./firebase-types";
import {
    JWSSignatureVerificationFailed,
    JWTClaimValidationFailed,
    JWTExpired,
    JWTInvalid
} from "jose/errors";


// JWK Token from Firebase
const projectId = firebase_config.projectId;

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// Cache of parsed keys
const jwkCache: Record<string, CryptoKey> = {};
const jwksRawCache: Record<string, unknown> = {};

async function getFirebasePublicKey(kid: string): Promise<CryptoKey> {
    if (jwkCache[kid]) return jwkCache[kid];

    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error("Failed to fetch Firebase JWKS");

    const { keys } = await res.json();

    for (const jwk of keys) {
        if (jwk.kid === kid && jwk.alg === 'RS256' && jwk.kty === 'RSA' && jwk.use === 'sig') {
            const cryptoKey = await importJWK(jwk, 'RS256') as CryptoKey;
            jwkCache[jwk.kid] = cryptoKey;
            jwksRawCache[jwk.kid] = jwk;
            return cryptoKey;
        }
    }

    throw new Error(`Unable to find valid key with kid=${kid}`);
}


export async function verifyFirebaseToken(idToken: string) {

    try {

        const { kid } = decodeProtectedHeader(idToken);
        const jwks = await getFirebasePublicKey(kid as string);

        const { payload } = await jwtVerify(idToken, jwks, {
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
            console.error(err);
            return {
                error: err,
                data: null
            };
        }

        // Should never happen
        throw err;
    }
}