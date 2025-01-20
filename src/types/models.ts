export type JwtToken = string;

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileUrl: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileUrl: string;
};
