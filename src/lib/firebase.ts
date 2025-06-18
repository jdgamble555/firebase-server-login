import { PRIVATE_GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { initializeApp, initializeServerApp } from 'firebase/app';
import type { FirebaseConfig } from './firebase-types';
import { getAuth, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';


export const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseConfig;
export const client_id = PUBLIC_GOOGLE_CLIENT_ID;
export const client_secret = PRIVATE_GOOGLE_CLIENT_SECRET;


// Config Options
export const client_redirect_uri = '/auth/callback';
export const FIREBASE_ID_TOKEN = 'firebase_id_token';
export const FIREBASE_REFRESH_TOKEN = 'firebase_refresh_token';


export const firebaseServer = async (authIdToken: string) => {

    const serverApp = initializeServerApp(firebase_config, {
        authIdToken
    });

    const auth = getAuth(serverApp);

    const db = getFirestore(serverApp);

    await auth.authStateReady();

    return {
        db,
        auth
    };
};

export const firebaseClient = async () => {

    const app = initializeApp(firebase_config);

    const db = getFirestore(app);

    return {
        db,
        auth: null
    };
};

export const getUser = (currentUser: User) => {
    return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        phoneNumber: currentUser.phoneNumber
    };
}