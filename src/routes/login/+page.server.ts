
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createGoogleOAuthLoginUrl } from '$lib/firebase-admin';

export const load: PageServerLoad = async () => {

    const loginUrl = createGoogleOAuthLoginUrl();

    redirect(302, loginUrl);
};