import { createLocalJWKSet, jwtVerify, type JWK } from "jose";
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

// Cache for the JWKS to avoid refetching on every request within the same Edge Function instance.
let preparedJWKS: ReturnType<typeof createLocalJWKSet>;

async function getPreparedJWKS() {
    // Return cached JWKS if already prepared
    if (preparedJWKS) {
        return preparedJWKS;
    }

    try {
        // Use the global fetch API available in Vercel's Edge Runtime
        const response = await fetch(JWKS_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch JWKS from ${JWKS_URL}: ${response.statusText}`);
        }

        // Parse the JWKS JSON response
        const jwksData = await response.json() as { keys: JWK[] };

        // Filter keys: We only want RSA keys intended for signature verification (use: 'sig')
        // and specifically for the RS256 algorithm. This explicit filtering is key.
        const rsaSigKeys = jwksData.keys.filter(jwk =>
            jwk.kty === 'RSA' &&   // Key type must be RSA
            jwk.use === 'sig' &&   // Key usage must be for signing
            jwk.alg === 'RS256'    // Algorithm must be RS256
        );

        if (rsaSigKeys.length === 0) {
            throw new Error("No suitable RS256 signing keys found in the JWKS response.");
        }

        // Create a JWK Set from the filtered keys. 'createJWKSet' will internally
        // use the Web Crypto API to import these keys.
        preparedJWKS = createLocalJWKSet({ keys: rsaSigKeys });
        return preparedJWKS;

    } catch (error: unknown) {
        console.error("Error preparing JWKS:", error);
        // Re-throw the error so that token verification fails gracefully
        throw error;
    }
}


export async function verifyFirebaseToken(idToken: string) {

    try {

        const jwks = await getPreparedJWKS();

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