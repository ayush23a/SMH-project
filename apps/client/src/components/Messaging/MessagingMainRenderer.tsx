import MessagingLeftPanel from "./MessagingLeftPanel";
import MessagingRightPanel from "./MessagingRightPanel";


export default function MessagingMainRenderer() {
    return (
        <div className="h-full w-full rounded-lg border border-neutral-700 overflow-hidden flex ">
            <MessagingLeftPanel />
            <MessagingRightPanel />
        </div>
    );
}