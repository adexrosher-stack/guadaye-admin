export const preferredLanguages = ["en", "am", "or", "ti", "so"] as const;

export type LocalizedRecord = Record<string, string>;

export function getLocalizedValue(value: unknown, fallback: string = ""): string {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		for (const lang of preferredLanguages) {
			const v = (value as LocalizedRecord)[lang];
			if (typeof v === "string" && v) return v;
		}
		const first = Object.values(value as LocalizedRecord).find(
			(v) => typeof v === "string" && v
		);
		if (typeof first === "string") return first;
	}
	return fallback;
}


