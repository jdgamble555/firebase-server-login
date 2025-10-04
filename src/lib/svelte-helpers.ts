import { getRequestEvent } from "$app/server";
import { client_redirect_uri, DEFAULT_REDIRECT_PAGE } from "./firebase";

export const getPathname = () => {

    const { request } = getRequestEvent();

    const referer = request.headers.get('referer');

    if (!referer) {
        return DEFAULT_REDIRECT_PAGE;
    }

    const url = new URL(referer);
    
    return url.searchParams.get("next") || DEFAULT_REDIRECT_PAGE;
}

export const getRedirectUri = () => {

    const { url } = getRequestEvent();

    return url.origin + client_redirect_uri;
};