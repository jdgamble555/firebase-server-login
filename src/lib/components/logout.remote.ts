import { form, getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";

export const logout = form('unchecked', async () => {

    const { locals: { authServer } } = getRequestEvent();

    authServer.signOut();

    redirect(302, '/');
});