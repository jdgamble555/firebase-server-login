import { getRequestEvent } from '$app/server';
import { PRIVATE_GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import type { FirebaseConfig } from './firebase-types';


export const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseConfig;

export const apiKey = firebase_config.apiKey;
export const projectId = firebase_config.projectId;
export const client_id = PUBLIC_GOOGLE_CLIENT_ID;
export const client_secret = PRIVATE_GOOGLE_CLIENT_SECRET;
export const client_redirect_uri = '/auth/callback';


export const getRedirectUri = () => {

    const { url } = getRequestEvent();

    return url.origin + client_redirect_uri;
};

