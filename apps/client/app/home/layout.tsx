import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import SessionSetter from "@/src/components/utility/SessionSetter";


export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    return (
        <div>
            {children}
            <SessionSetter session={session} />
        </div>
    );
}