
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createGoogleOAuthLoginUrl } from '$lib/firebase-admin';

export const load: PageServerLoad = async () => {

    const loginUrl = createGoogleOAuthLoginUrl();

    redirect(302, loginUrl);
};

// TODO - server actions - logout, callback, googleLogin
// TODO - nav in layout, add home page, create login / logout dynamic
// TODO - add firebase server to layout.server.ts, see if can share without await?