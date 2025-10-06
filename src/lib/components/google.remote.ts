import { form, getRequestEvent } from "$app/server";
import { getPathname, getRedirectUri } from "$lib/svelte-helpers";
import { redirect } from "@sveltejs/kit";

export const google = form('unchecked', async () => {

    const { locals: { authServer } } = getRequestEvent();

    const redirect_uri = getRedirectUri();
    const path = getPathname();

    const loginUrl = await authServer.getGoogleLoginURL(
        redirect_uri,
        path
    );

    redirect(302, loginUrl);
});