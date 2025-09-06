"use client"

import FriendRequestModal from "@/src/components/utility/FriendRequestModal";


export default function Chat() {
    return (
        <div>
            <FriendRequestModal
                fromUser={{
                    id: '209uoidjfoijf90390jdn0',
                    name: 'Anjan Suman',
                    email: 'anjansuman80@gmail.com',
                    image: 'https://lh3.googleusercontent.com/a/ACg8ocIprC-ECSlXXMXBpG0bkwvgZ77loevC4XmVBvn-3ogmBKUzNiCz=s96-c'
                }}
                onAccept={() => {}}
                onReject={() => {}}
                onBlock={() => {}}
            />
        </div>
    )
}