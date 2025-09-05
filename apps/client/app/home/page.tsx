import HomeRightComponent from "@/src/components/home/HomeRightComponent";
import SidePanel from "@/src/components/home/SidePanel";
import HomeNavbar from "@/src/components/navbars/HomeNavbar";


export default function Home() {
    return (
        <div className="h-full w-full flex ">
            <HomeNavbar />
            <SidePanel />
            <div className="w-full text-red-600 pt-30 ">
                <HomeRightComponent />
            </div>
        </div>
    );
}