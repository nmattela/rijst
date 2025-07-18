import app from "ags/gtk4/app"
import { Astal, Gdk, Gtk } from "ags/gtk4"
// import Astal from "ags/gtk4/astal"
import { createBinding, createState, For, With } from "ags"
import Workspaces from "./Workspaces"
import SystemTray from "./SystemTray"
import Power from "./Power"
import SystemMenu from "./SystemMenu"
import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"

export default function Bar(gdkmonitor: Gdk.Monitor) {

    const notifd = Notifd.get_default()

    const [notifications, setNotifications] = createState<Array<Notifd.Notification>>([])
    notifd.connect(`notified`, (_, id) => {
        const notification = notifd.get_notification(id)
        setNotifications(notifications => [...notifications, notification])
    })

    const time = createPoll("", 1000, () => GLib.DateTime.new_now_local().format(`%H:%M:%S`)!)
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    return (
        <>
            <window
                class="Bar"
                name={`Bar`}
                gdkmonitor={gdkmonitor}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                anchor={TOP | LEFT | RIGHT}
                application={app}
                visible={true}
            >
                <centerbox>
                    <Workspaces $type="start" />
                    <button
                        class="clock"
                        $type={"center"}
                    >
                        <label label={time} />
                    </button>
                    <box
                        halign={Gtk.Align.END}
                        $type={"end"}
                        spacing={150}
                    >
                        <SystemTray />
                        <Power />
                    </box>
                    {/* {
                        showSystemMenu(showSystemMenu => {
                            print(`blop`)
                            return showSystemMenu && (
                                <SystemMenu gdkmonitor={gdkmonitor} />
                            )
                        })
                    } */}
                    {/* <overlay> */}
                        {/* <revealer
                            // $type={`overlay`}
                            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                            revealChild={notification !== undefined}
                        > */}
                            {/* <For each={notifications}>
                                {notification => (
                                    <Notification
                                        notification={notification}
                                        dismiss={() => setNotifications([])}
                                    />
                                )}
                            </For> */}
                        {/* </revealer> */}
                    {/* </overlay> */}
                </centerbox>
            </window>
        </>
    )
}
