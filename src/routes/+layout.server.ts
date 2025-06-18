import { getUser } from "$lib/firebase";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { getFirebaseServer } }) => {

    const { data } = await getFirebaseServer();

    if (!data.auth) {
        return {
            user: null
        };
    }

    if (data.auth.currentUser === null) {
        return {
            user: null
        };
    }

    const user = getUser(data.auth.currentUser);

    return {
        user
    };

}) satisfies LayoutServerLoad;