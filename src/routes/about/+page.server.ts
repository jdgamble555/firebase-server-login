import { getAbout } from "$lib/about";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { firebaseServer } from "$lib/firebase";


export const load = (async ({ locals: { authServer }, url }) => {

    const { data: user } = await authServer.getToken();

    if (!user) {
        redirect(302, '/login?next=' + url.pathname);
    }

    const { db } = await firebaseServer(user.idToken);

    return {
        about: await getAbout(db)
    };

}) satisfies PageServerLoad;