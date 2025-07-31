import app from "ags/gtk4/app"
import { Astal, Gdk, Gtk } from "ags/gtk4"
// import Astal from "ags/gtk4/astal"
import { Accessor, createBinding, createState, For, With } from "ags"
import Workspaces from "./Workspaces"
import SystemTray from "./SystemTray"
import { PowerButton } from "./Power"
import SystemMenu from "./SystemMenu"
import { createPoll } from "ags/time"
import GLib from "gi://GLib?version=2.0"
import Notifd from "gi://AstalNotifd"
import Notification from "./Notification"
import Desktop from "./Desktop"
import Hyprland from "gi://AstalHyprland"

export default function Bar(gdkmonitor: Gdk.Monitor) {

    const notifd = Notifd.get_default()
    const hyprland = Hyprland.get_default()

    const focusedClient: Accessor<Hyprland.Client | null> = createBinding(hyprland, `focusedClient`)

    focusedClient.subscribe(() => console.log(`focused client: `, focusedClient.get()))

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
                class={focusedClient.as(focusedClient => `Bar ${focusedClient !== null ? `BarFocused` : ``}`)}
                name={`Bar`}
                gdkmonitor={gdkmonitor}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                anchor={TOP | LEFT | RIGHT}
                application={app}
                visible={true}
            >
                <centerbox>
                    <box
                        $type="start"
                        hexpand
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                    >
                        <button
                            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                            onClicked={() => app.toggle_window(`App Launcher`)}
                        >
                            <image
                                iconName={`launcher-symbolic`}
                                iconSize={Gtk.IconSize.LARGE}
                                pixelSize={30}
                            />
                        </button>
                        <Workspaces />
                    </box>
                    <button
                        $type={"center"}
                        class="clock"
                    >
                        <label label={time} />
                    </button>
                    <box
                        halign={Gtk.Align.END}
                        $type={"end"}
                        spacing={150}
                    >
                        <SystemTray />
                        <PowerButton />
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
