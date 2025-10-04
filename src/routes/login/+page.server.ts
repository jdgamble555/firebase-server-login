import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logout } from '$lib/firebase-server';
import { createGoogleOAuthLoginUrl } from '$lib/google-oauth';
import { getPathname, getRedirectUri } from '$lib/svelte-helpers';

// TODO - redirect if logged in

export const actions = {

    google: async () => {

        logout();

        const redirect_uri = getRedirectUri();
        const path = getPathname();

        const loginUrl = createGoogleOAuthLoginUrl(redirect_uri, path);

        redirect(302, loginUrl);
    },

    logout: async () => {

        logout();

        redirect(302, '/');
    }

} satisfies Actions;