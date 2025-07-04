export type FirebaseRestError = {
    error: {
        code: number;
        message: string;
        errors?: {
            message: string;
            domain: string;
            reason: string;
        }[];
    };
};

export type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
};

export type FirebaseCreateAuthUriResponse = {
    authUri: string;
    registered?: boolean;
    providerId?: string;
    allProviders?: string[];
    signinMethods?: string[];
    sessionId?: string;
};

export type FirebaseIdpSignInResponse = {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    email?: string;
    emailVerified?: boolean;
    providerId: string;
    federatedId: string;
    oauthIdToken?: string;
    rawUserInfo?: string;
};

export type GoogleTokenResponse = {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: "Bearer";
    id_token: string;
};

export type FirebaseRefreshTokenResponse = {
    access_token: string;
    expires_in: string;
    token_type: "Bearer";
    refresh_token: string;
    id_token: string;
    user_id: string;
    project_id: string;
};

export type FirebaseIdTokenPayload = {
    iss: string;
    aud: string;
    auth_time: number;
    user_id: string;
    sub: string;
    iat: number;
    exp: number;
    email?: string;
    email_verified?: boolean;
    firebase: {
        identities: {
            email?: string[];
            "google.com"?: string[];
            [provider: string]: string[] | undefined;
        };
        sign_in_provider: string;
        tenant?: string;
    };
    uid?: string;
    name?: string;
    picture?: string;
};
