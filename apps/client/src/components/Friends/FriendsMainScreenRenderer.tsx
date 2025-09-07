"use client";

import { useFriendStore } from "@/src/store/friends/useFriendsStore";
import AddFriend from "./AddFriend";
import ProfileCard from "../utility/ProfileCard";
import { useState } from "react";


export default function FriendsMainScreenRenderer() {

    const { friends } = useFriendStore();
    const [addFriendsPanel, setAddFriendsPanel] = useState<boolean>(false);

    return (
        <div className="bg-black border border-neutral-800 rounded-xl p-6 w-full h-full  ">
            {friends.length === 0 ? (
                <div className="w-full h-full flex justify-center items-center ">
                    <div
                    className="bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-700 cursor-pointer  "
                    onClick={() => setAddFriendsPanel(true)}
                    >
                        Add Friends
                    </div>
                </div>
            ): (
                friends.map((friend, index) => (
                    <div key={index}>
                        <ProfileCard
                            name={friend.name || ''}
                            image={friend.image || ''}
                            id={friend.id || ''}
                            email={friend.email || ''}
                        />
                    </div>
                ))
            )}
            {addFriendsPanel && (
                <AddFriend />
            )}
        </div>
    );
}