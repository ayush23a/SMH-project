import axios from 'axios';
import { Account, AuthOptions, ISODateString } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from "next-auth/providers/google";
import { SIGNIN_URL } from '../../../../src/routes/routes';

export interface UserType {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    token?: string | null;
}

export interface CustomSession {
    user?: UserType;
    expires: ISODateString;
}

export const authOptions: AuthOptions = {
    callbacks: {
        async signIn({ user, account }: { user: UserType, account: Account | null }) {
            try {
                if(account?.provider === 'google') {
                    const response = await axios.post(SIGNIN_URL, {
                        user,
                        account,
                    });

                    const result = response.data;
                    if(result?.success) {
                        user.id = result.user.id.toString();
                        user.token = result.token;
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if(user) {
                token.user = user as UserType;
            }
            return token;
        },
        async session({ session, token }: { session: CustomSession, token: JWT }) {
            session.user = token.user as UserType;
            return session;
        }
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ]
}