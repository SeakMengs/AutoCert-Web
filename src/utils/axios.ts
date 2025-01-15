import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AccessTokenCookie, getApiBaseUrl} from ".";
import { ResponseJson } from "@/types/response";
import { HttpStatusCode } from "@/types/http";
import { getCookie, refreshAccessToken } from "./server_cookie";

const apiBaseUrl = getApiBaseUrl();

export const api = axios.create({
    baseURL: apiBaseUrl,
});

// Handle auto refresh token and set bearer token in the header. Does not handle auto refresh token for server side call.
export const apiWithAuth = axios.create({
    baseURL: apiBaseUrl,
    // If you want to send cookies with the request. | Keep in mind that api allow origin should not be "*".
    // withCredentials: true,
});

apiWithAuth.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const accessToken = await getCookie(AccessTokenCookie);
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    }
);

apiWithAuth.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError<ResponseJson<any>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            // Extend the _retry such that we can track if the request has already been retried
            _retry?: boolean;
        }
        const status = error.response?.status;
        const isClientSide = typeof window !== "undefined";

        // If the error is 401 and the request has not been retried, try to refresh the token and retry the request
        // It only perform on client side call, because server side call will not have access to the cookie
        if (originalRequest && status === HttpStatusCode.UNAUTHORIZED_401 && !originalRequest._retry && isClientSide) {
            originalRequest._retry = true;
            const isRefreshed = await refreshAccessToken();
            if (isRefreshed) {
                return apiWithAuth(originalRequest);
            }

            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);