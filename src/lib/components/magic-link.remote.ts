import { form, getRequestEvent } from "$app/server";
import * as v from "valibot";

const emailSchema = v.object({
    email: v.pipe(v.string(), v.email())
});

export const magicLink = form(emailSchema, async (data) => {

    const { locals: { authServer } } = getRequestEvent();

    const { error } = await authServer.auth.sendSignInLinkToEmail(data.email, {
        continueUrl: 'http://localhost:5173/auth/callback',
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
});