import { getRequestEvent } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { firebase_config } from "./firebase";


export const firebaseServer = async () => {

    // Check for token
    const { locals: { getVerifedToken } } = getRequestEvent();

    const { data: authIdToken } = await getVerifedToken();

    if (!authIdToken) {
        redirect(302, '/login');
    }

    // Login with the token
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