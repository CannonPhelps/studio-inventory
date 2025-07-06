// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string;
				role: string;
				department?: string | null;
				phone?: string | null;
			};
			session?: {
				id: string;
				expiresAt: Date;
				fresh: boolean;
				userId: string;
			};
		}
	}
}

export {};
