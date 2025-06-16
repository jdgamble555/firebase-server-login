import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { exchangeCodeForFirebaseToken } from '$lib/firebase-admin';
import { storeToken } from '$lib/handle-session';

export const load: PageServerLoad = async ({ url }) => {

    const code = url.searchParams.get('code');

    if (!code) {
        error(400, 'Invalid URL!');
    }

    const {
        data: exchangeData,
        error: exchangeError
    } = await exchangeCodeForFirebaseToken(code);

    if (exchangeError) {
        console.error(exchangeError);
        error(400, exchangeError);
    }

    if (!exchangeData) {
        error(400, 'No exchange data!');
    }

    const { idToken, refreshToken } = exchangeData;

    storeToken(idToken, refreshToken);

    redirect(302, '/');
};