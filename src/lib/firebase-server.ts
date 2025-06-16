import { PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { error } from "@sveltejs/kit";
import { initializeApp, initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG);

export const firebaseServer = async (authIdToken: string) => {

    if (!authIdToken) {

        const serverApp = initializeApp(firebase_config);

        const db = getFirestore(serverApp);
        
        return {
            auth: null,
            db
        };
    }

    const serverApp = initializeServerApp(firebase_config, {
        authIdToken
    });

    const auth = getAuth(serverApp);

    const db = getFirestore(serverApp);

    await auth.authStateReady();

    if (auth.currentUser === null) {
        error(401, 'Invalid Token');
    }

    return {
        auth,
        db
    };
};