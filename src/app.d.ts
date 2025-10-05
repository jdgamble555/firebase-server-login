// See https://svelte.dev/docs/kit/types#app.d.ts

import type { FirebaseAdminAuth } from "$lib/firebase-admin-auth";
import type { getFirebaseServer } from "$lib/firebase-server";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			getFirebaseServer: typeof getFirebaseServer;
			auth: FirebaseAdminAuth;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
