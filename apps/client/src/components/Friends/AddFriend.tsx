import getUserData from "@/src/backend/get-user-data";
import { cn } from "@/src/lib/utils";
import { useUserSessionStore } from "@/src/store/user/useUserSessionStore";
import { User } from "@/src/types/prisma-types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import ProfileCard from "../utility/ProfileCard";
import { BiLoader } from "react-icons/bi";

export default function AddFriend() {
    const [inputValue, setInputValue] = useState<string>("")
    const [userData, setUserData] = useState<Partial<User> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useUserSessionStore();

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            fetchUser();
        }
    }

    async function fetchUser() {
        setLoading(true);

        if (!inputValue || !session?.user?.token) {
            console.log("missing input or session", inputValue, session);
            setLoading(false);
            return;
        }

        const data = await getUserData(inputValue, session.user.token);
        setUserData(data);
        setLoading(false);
    }

    return (
        <div className="w-[600px] h-[500px] absolute top-1/2 left-1/2 -translate-1/2 bg-neutral-800 border border-neutral-700 rounded-lg flex flex-col p-4 ">
            <div className="bg-neutral-900 flex gap-x-2 rounded-lg justify-center items-center pr-3">
                <input
                    placeholder="Enter a userId"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "w-full h-10 bg-neutral-900 rounded-lg focus:outline-none px-3 "
                    )}
                />
                <div
                    className="flex justify-center items-center p-0.5 hover:bg-neutral-800 transition-colors rounded-full cursor-pointer"
                    onClick={fetchUser}
                >
                    <ChevronRight />
                </div>
            </div>
            <div className="w-full flex justify-center items-center ">
                {loading && <BiLoader className="animate-spin" />}
            </div>
            <div className="w-full flex justify-center items-center ">
                {userData && (
                    <ProfileCard
                        name={userData.name || ""}
                        email={userData.email || ""}
                        id={userData.id || ""}
                        image={userData.id || ""}
                    />
                )}
            </div>
        </div>
    );
}
