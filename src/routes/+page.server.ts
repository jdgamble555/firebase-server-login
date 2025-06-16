import { getAbout } from "$lib/about";
import { firebaseServer } from "$lib/firebase-server";
import type { PageServerLoad } from "./$types";


export const load = (async ({ locals: { getToken } }) => {


    const token = getToken();

    if (token) {
        const { db } = await firebaseServer(token);
        const about = await getAbout(db);
        console.log(about);
    }


}) satisfies PageServerLoad;