import { signOut } from 'next-auth/react';
import { Dispatch, SetStateAction } from 'react';
import OpacityBackground from './OpacityBackground';
import { cn } from '@/src/lib/utils';

interface LogoutModalProps {
    openLogoutModal: boolean;
    setOpenLogoutModal: Dispatch<SetStateAction<boolean>>;
}

export default function LogoutModal({ openLogoutModal, setOpenLogoutModal }: LogoutModalProps) {
    async function LogoutHandler() {
        signOut({
            callbackUrl: '/',
        });
    }

    return (
        <div>
            {openLogoutModal && (
                <OpacityBackground onBackgroundClick={() => setOpenLogoutModal(false)}>
                    <div
                        className="max-w-md px-8 py-6 flex flex-col items-center justify-center space-y-6 bg-neutral-950 rounded-lg border border-neutral-700 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                                Log out ?
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                                You will be logged out of your session and redirected to the Sign in
                                Page.
                            </p>
                        </div>

                        <div className="flex gap-4 w-full">
                            <button
                                type="button"
                                onClick={() => setOpenLogoutModal(false)}
                                className={cn(
                                    "w-1/2 px-4 py-2 text-sm dark:text-light-base text-dark-base bg-neutral-900 hover:bg-neutral-900/70 transition-colors cursor-pointer",
                                    "flex justify-center items-center rounded-md"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={LogoutHandler}
                                className={cn(
                                    "w-1/2 px-4 py-2 text-sm bg-red-500 hover:bg-red-500/85 transition-colors text-neutral-200 cursor-pointer",
                                    "flex justify-center items-center rounded-md"
                                )}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </OpacityBackground>
            )}
        </div>
    );
}
