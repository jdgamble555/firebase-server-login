import type { CookieOptions, GetSession, SetSession } from "./cookie-types";
import { FirebaseAdminAuth } from "./firebase-admin-auth";
import { FirebaseAuth } from "./firebase-auth";
import { signJWTCustomToken } from "./firebase-jwt";
import type { FirebaseConfig, ServiceAccount } from "./firebase-types";
import { createGoogleOAuthLoginUrl, exchangeCodeForGoogleIdToken } from "./google-oauth";

const DEFAULT_SESSION_NAME = '__session';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 5 * 1000
} as CookieOptions;

export class FirebaseAuthServer {

    auth: FirebaseAuth;
    adminAuth: FirebaseAdminAuth;

    private sessionName: string;

    constructor(
        private serviceAccountKey: ServiceAccount,
        private firebase_config: FirebaseConfig,
        private providers: {
            google: {
                client_id: string,
                client_secret: string
            }
        },
        private cookies: {
            getSession: GetSession,
            saveSession: SetSession,
            sessionName?: string
        },
        private fetch?: typeof globalThis.fetch
    ) {
        this.auth = new FirebaseAuth(this.firebase_config, fetch);
        this.adminAuth = new FirebaseAdminAuth(this.serviceAccountKey, fetch);

        this.sessionName = this.cookies.sessionName || DEFAULT_SESSION_NAME;
    }

    private deleteSession() {
        this.cookies.saveSession(
            this.sessionName,
            '',
            {
                ...COOKIE_OPTIONS,
                maxAge: 0
            }
        );
    }

    signOut() {
        this.deleteSession();
        return;
    }

    async getUser(checkRevoked: boolean = false) {

        const sessionCookie = await this.cookies.getSession(this.sessionName);

        if (!sessionCookie) {
            return {
                data: null,
                error: null
            };
        }

        const {
            data: decodedToken,
            error: verifyError
        } = await this.adminAuth.verifySessionCookie(sessionCookie, checkRevoked);

        if (verifyError) {

            this.deleteSession();

            return {
                data: null,
                error: verifyError
            };
        }

        if (!decodedToken) {

            this.deleteSession();

            return {
                data: null,
                error: null
            };
        }

        return {
            data: decodedToken,
            error: null
        };
    }

    async getGoogleLoginURL(
        redirect_uri: string,
        path: string
    ) {

        this.deleteSession();

        const { client_id } = this.providers.google;

        return createGoogleOAuthLoginUrl(
            redirect_uri,
            path,
            client_id
        );

    }

    async signInWithGoogleWithCode(
        code: string,
        redirect_uri: string
    ) {
        const { client_id, client_secret } = this.providers.google;

        const {
            data: exchangeData,
            error: exchangeError
        } = await exchangeCodeForGoogleIdToken(
            code,
            redirect_uri,
            client_id,
            client_secret,
            this.fetch
        );

        if (exchangeError) {
            return {
                error: exchangeError
            };
        }

        if (!exchangeData) {
            return {
                error: new Error('No exchange data!')
            };
        }

        const {
            data: signInData,
            error: signInError
        } = await this.auth.signInWithProvider(
            exchangeData.id_token,
            redirect_uri
        );

        if (signInError) {
            console.error(signInError);
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

        const {
            data: sessionCookie,
            error: sessionError
        } = await this.adminAuth.createSessionCookie(
            signInData.idToken,
            { expiresIn: 60 * 60 * 24 * 5 * 1000 }
        );

        if (sessionError) {
            return {
                error: sessionError
            };
        }

        if (!sessionCookie) {
            return {
                error: new Error('No session cookie returned')
            };
        }

        this.cookies.saveSession(
            this.sessionName,
            sessionCookie,
            COOKIE_OPTIONS
        );

        return {
            error: null
        };
    }

    async getToken() {

        const {
            data: verifiedToken,
            error: verifyError
        } = await this.getUser();

        if (verifyError) {
            return {
                data: null,
                error: verifyError
            };
        }

        if (!verifiedToken) {
            return {
                data: null,
                error: null
            };
        }

        const {
            data: signJWTData,
            error: signJWTError
        } = await signJWTCustomToken(
            verifiedToken.sub,
            this.serviceAccountKey
        );

        if (signJWTError) {
            return {
                data: null,
                error: signJWTError
            };
        }

        if (!signJWTData) {
            return {
                data: null,
                error: new Error('No custom token signed')
            };
        }

        const {
            data: signInData,
            error: signInError
        } = await this.auth.signInWithCustomToken(
            signJWTData
        );

        if (signInError) {
            console.error(signInError);
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
}

