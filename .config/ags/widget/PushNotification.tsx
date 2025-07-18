import { Astal, Gdk } from "ags/gtk4";

export default function PushNotification(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <window
            class={`PushNotification`}
            name={`Push Notification`}
            layer={Astal.Layer.TOP}
            
        >

        </window>
    )
}