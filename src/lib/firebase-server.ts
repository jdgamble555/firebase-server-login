import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { firebase_config } from "./firebase";
import { getVerifiedToken } from "./firebase-session";

export const getFirebaseServer = async () => {

    const {
        data: authIdToken,
        error: verifyError
    } = await getVerifiedToken();

    if (verifyError) {
        return {
            data: null,
            error: verifyError
        };
    }

    if (!authIdToken) {
        return {
            data: null,
            error: null
        };
    }

    // Login with the token
    const serverApp = initializeServerApp(firebase_config, {
        authIdToken
    });

    const auth = getAuth(serverApp);

    const db = getFirestore(serverApp);

    await auth.authStateReady();

    if (auth.currentUser === null) {
        return {
            data: null,
            error: new Error('Invalid Token')
        };
    }

    return {
        error: null,
        data: {
            db,
            auth
        }
    };
};