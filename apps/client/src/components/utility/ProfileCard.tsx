import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { useUserSessionStore } from "../store/user/useUserSessionStore";
import { FaCopy } from "react-icons/fa";
import { toast } from 'sonner';

export default function ProfileCard({ variant = 'ghost' }: { variant?: 'ghost' | 'golden' }) {
    const { session } = useUserSessionStore();

    async function copyId() {
        await navigator.clipboard.writeText(session?.user.id || '');
        toast.success('user id copied to clipboard');
    }

    return (
        <div
            className={cn(
                "w-full border rounded-lg px-4 py-2 ",
                variant === 'ghost' ? 'border-neutral-700 text-neutral-200 ' : 'border-[#565449] text-[#D8CFBC] ',
                'flex justify-between items-center gap-x-3'
            )}
        >
            <div
                className="h-8 w-8 rounded-full border border-neutral-600 overflow-hidden cursor-pointer"
            >
                <Image
                    src={session?.user.image || "/default-avatar.png"}
                    alt={session?.user.name || "user"}
                    unoptimized
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                />
            </div>
            <div className="w-full ">
                <div className="w-full flex justify-between items-center">
                    <div>
                        {session?.user.name}
                    </div>
                    <FaCopy size={12} className="cursor-pointer hover:text-[#D8CFBC] transition-colors " onClick={copyId} />
                </div>
                <div className={cn(
                    "text-sm ",
                    variant === 'ghost' ? 'text-neutral-200/70' : 'text-[#D8CFBC]/70 '
                )}>
                    {session?.user.email}
                </div>
            </div>
        </div>
    );
}