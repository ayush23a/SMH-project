import { cn } from "../../lib/utils";
import NavbarSigninAction from "./NavbarSignAction";


export default function Navbar() {

    return (
        <div className="fixed w-full flex justify-between px-4 py-2  ">
            <NavbarSigninAction />
        </div>
    );
}