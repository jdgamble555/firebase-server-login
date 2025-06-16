import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.getToken = () => {

        const id_token = event.cookies.get('firebase_id_token');

        if (!id_token) {
            return null;
        }

        return id_token;
    };

    return resolve(event);
};