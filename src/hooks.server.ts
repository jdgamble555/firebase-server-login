import { getVerifiedToken } from "$lib/firebase-session";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.getVerifedToken = async () => await getVerifiedToken();

    return resolve(event);
};