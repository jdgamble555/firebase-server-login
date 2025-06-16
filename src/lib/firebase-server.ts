import { getRequestEvent } from "$app/server";
import { PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { error, redirect } from "@sveltejs/kit";
import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { verifyFirebaseToken } from "./firebase-admin";
import { logout } from "./handle-session";

const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG);

export const firebaseServer = async () => {

    // Check for token
    const { locals: { getToken } } = getRequestEvent();

    const authIdToken = getToken();

    if (!authIdToken) {
        redirect(302, '/login');
    }

    // Verify the token
    const { error: verifyError, data } = await verifyFirebaseToken(authIdToken);

    if (verifyError) {
        console.error("Token verification failed:", verifyError);
        logout();
        redirect(302, "/login");
    }
    if (!data) {
        console.error("No data returned from token verification");
        logout();
        redirect(302, "/login");
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