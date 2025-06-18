import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loginWithCode } from '$lib/firebase-server';

export const load: PageServerLoad = async ({ url }) => {

    const code = url.searchParams.get('code');

    if (!code) {
        error(400, 'Invalid URL!');
    }

    const { error: loginError } = await loginWithCode(code);

    if (loginError) {
        console.error(loginError);
        error(400, loginError);
    }

    redirect(302, '/');
};