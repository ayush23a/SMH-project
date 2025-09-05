'use client';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react'
import { useState } from 'react';
import LoginModal from '../utility/LoginModal';
import { useUserSessionStore } from '../store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';

export default function NavbarSigninAction() {
    const { session } = useUserSessionStore();
    const router = useRouter();
    const [opensignInModal, setOpenSignInModal] = useState<boolean>(false);

    function handler() {
        if (!session?.user.token) {
            setOpenSignInModal(true);
        } else {
            router.push('/home');
        }
    }

    return (
        <div className="">
            <div
                onClick={handler}
                className={cn(
                    'font-light text-base tracking-wide flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer z-[10] pr-1 rounded-lg',
                    'bg-neutral-900 text-neutral-200 px-4 py-2',
                )}
            >
                <span>{session?.user ? 'Go to app' : 'Sign in'}</span>
                <ChevronRight className="text-neutral-300 dark:text-dark-base" />
            </div>
            <LoginModal opensignInModal={opensignInModal} setOpenSignInModal={setOpenSignInModal} />
        </div>
    );
}
