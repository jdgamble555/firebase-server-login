import { PRIVATE_FIREBASE_ADMIN_CONFIG } from "$env/static/private";
import { FirebaseAdminAuth } from "$lib/firebase-admin-auth";
import { getFirebaseServer } from "$lib/firebase-server";
import type { Handle } from "@sveltejs/kit";

const firebaseServiceAccount = JSON.parse(PRIVATE_FIREBASE_ADMIN_CONFIG);;

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.getFirebaseServer = getFirebaseServer;

    const auth = new FirebaseAdminAuth(
        firebaseServiceAccount,
        event.fetch
    );

    event.locals.auth = auth;

    return resolve(event);
};