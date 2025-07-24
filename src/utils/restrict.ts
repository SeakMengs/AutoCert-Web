export function hasFullAccess(email: string): boolean {
	const domain = process.env.FULL_ACCESS_EMAIL_DOMAIN;
	if (!domain) {
		return true; // unrestricted
	}
	return email.endsWith(domain);
}