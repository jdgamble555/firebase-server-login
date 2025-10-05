import { PRIVATE_FIREBASE_ADMIN_CONFIG, PRIVATE_GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { FirebaseAuthServer } from "$lib/firebase-auth-server";
import type { Handle } from "@sveltejs/kit";

const firebaseServiceAccount = JSON.parse(PRIVATE_FIREBASE_ADMIN_CONFIG);
const firebaseConfig = JSON.parse(PUBLIC_FIREBASE_CONFIG);

export const handle: Handle = async ({ event, resolve }) => {

    const authServer = new FirebaseAuthServer(
        firebaseServiceAccount,
        firebaseConfig,
        {
            google: {
                client_id: PUBLIC_GOOGLE_CLIENT_ID,
                client_secret: PRIVATE_GOOGLE_CLIENT_SECRET
            }
        },
        {
            getSession: (name) => event.cookies.get(name),
            saveSession: (name, value, options) => event.cookies.set(name, value, options)
        },
        event.fetch
    );

    event.locals.authServer = authServer;

    return resolve(event);
};