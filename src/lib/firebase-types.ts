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
