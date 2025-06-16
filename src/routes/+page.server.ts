import { getAbout } from "$lib/about";
import { firebaseServer } from "$lib/firebase-server";
import type { PageServerLoad } from "./$types";


export const load = (async () => {

    const { db } = await firebaseServer();
    const about = await getAbout(db);
    console.log(about);

}) satisfies PageServerLoad;