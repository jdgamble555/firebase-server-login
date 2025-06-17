import { getUser } from "$lib/handle-session";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.getUser = async () => await getUser();

    return resolve(event);
};