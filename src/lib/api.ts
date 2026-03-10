import axios, { AxiosInstance, AxiosHeaders } from "axios";
import { getToken } from "./auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://admin.macrovian.org/api";
const secondaryBaseURL =
	import.meta.env.VITE_SECONDARY_API_BASE_URL || "https://macrovian.org/api";

const createClient = (url: string): AxiosInstance =>
	axios.create({
		baseURL: url,
		withCredentials: false,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	});

const attachAuthInterceptor = (client: AxiosInstance) => {
	client.interceptors.request.use((config) => {
		const token = getToken();
		if (token) {
			const headers = config.headers
				? new AxiosHeaders(config.headers)
				: new AxiosHeaders();
			headers.set("Authorization", `Bearer ${token}`);
			config.headers = headers;
		}
		return config;
	});
};

export const apiClient = createClient(`${baseURL}`);
export const secondaryApiClient = createClient(`${secondaryBaseURL}`);

attachAuthInterceptor(apiClient);
attachAuthInterceptor(secondaryApiClient);

export default apiClient;
