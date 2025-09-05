'use client';
import { signIn } from 'next-auth/react';
import { Dispatch, SetStateAction } from 'react';
import OpacityBackground from './OpacityBackground';
import Image from 'next/image';

interface LoginModalProps {
    opensignInModal: boolean;
    setOpenSignInModal: Dispatch<SetStateAction<boolean>>;
}

export default function LoginModal({ opensignInModal, setOpenSignInModal }: LoginModalProps) {
    async function signinHandler() {
        signIn('google', {
            redirect: false,
            callbackUrl: '/',
        });
    }

    return (
        <div>
            {opensignInModal && (
                <OpacityBackground onBackgroundClick={() => setOpenSignInModal(false)}>
                    <div className="max-w-md px-8 py-6 flex flex-col items-center justify-center space-y-6 bg-neutral-950 rounded-lg border border-neutral-700 shadow-md">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                                Sign in to continue
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                                Log in to access your personalized dashboard, and access to all the services.
                            </p>
                        </div>
                        <div
                            onClick={signinHandler}
                            className="w-full flex items-center justify-center gap-3 px-6 py-[22px] text-sm font-medium bg-neutral-800 hover:bg-neutral-800/70 rounded-md border-[1px] transition-colors duration-200  dark:border-neutral-700 cursor-pointer"
                        >
                            <Image
                                src="/images/google.png"
                                height={24}
                                width={24}
                                alt="Google"
                                priority
                                unoptimized
                            />
                            <span className="text-neutral-200 ">
                                Sign in with Google
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
                            By signing in, you agree to our
                            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                {' '}
                                Terms of Service
                            </span>{' '}
                            and
                            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                {' '}
                                Privacy Policy
                            </span>
                        </p>
                    </div>
                </OpacityBackground>
            )}
        </div>
    );
}
