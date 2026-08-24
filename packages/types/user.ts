export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

/** Respuesta del login (POST /api/users/login) */
export interface AuthPayload {
  user: User;
  token: string;
}
