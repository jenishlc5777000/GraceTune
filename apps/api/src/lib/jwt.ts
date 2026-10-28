import { jwtVerify, SignJWT } from 'jose';
import type { Role } from '@gracetunes/shared';
import { env } from '../config/env';

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export interface AccessClaims {
  sub: string;
  role: Role;
}

export function signAccessToken(claims: AccessClaims) {
  return new SignJWT({ role: claims.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  return { sub: payload.sub!, role: payload.role as Role };
}
