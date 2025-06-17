import { getAbout } from "$lib/about";
import { getFirebaseServer } from "$lib/firebase-server";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load = (async () => {

    const { data, error: firebaseError } = await getFirebaseServer();

    if (firebaseError) {
        error(400, firebaseError);
    }

    if (!data) {
        redirect(302, '/login');
    }

    const { db } = data;

    return {
        about: await getAbout(db)
    };

}) satisfies PageServerLoad;