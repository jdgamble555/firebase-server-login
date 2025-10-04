import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logout } from '$lib/firebase-server';
import { createGoogleOAuthLoginUrl } from '$lib/google-oauth';

// TODO - redirect if logged in

export const actions = {

    google: async () => {

        logout();

        const loginUrl = createGoogleOAuthLoginUrl();

        redirect(302, loginUrl);
    },

    logout: async () => {

        logout();

        redirect(302, '/');
    }

} satisfies Actions;