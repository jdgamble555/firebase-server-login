import { PUBLIC_FIREBASE_CONFIG } from '$env/static/public';
import { initializeServerApp } from 'firebase/app';
import type { FirebaseConfig } from './firebase-types';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';


export const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseConfig;


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

// TODO - fix errors
// TODO - cache
// TODO - login with magic link
// TODO - copy to surreal repo
// TODO - write tests