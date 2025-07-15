import app from "ags/gtk3/app"
import { Astal, Gdk, Gtk } from "ags/gtk3"
// import Astal from "ags/gtk3/astal"
import { createBinding, createState } from "ags"
import Workspaces from "./Workspaces"
import { Box } from "astal/gtk3/widget"
import SystemTray from "./SystemTray"
import Power from "./Power"
import SystemMenu from "./SystemMenu"
import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"

export default function Bar(gdkmonitor: Gdk.Monitor) {
    const time = createPoll("", 1000, () => GLib.DateTime.new_now_local().format(`%H:%M:%S`)!)
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
    print(`penis`)

    return (
        <>
            <window
                class="Bar"
                gdkmonitor={gdkmonitor}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                anchor={TOP | LEFT | RIGHT}
                application={app}
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
                </centerbox>
            </window>
        </>
    )
}
