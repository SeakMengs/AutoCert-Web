export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const JWT_SECRET = process.env.AUTH_JWT_SECRET || "api_jwt_secret";