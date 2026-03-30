import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Notification from "./Notification";
import { createState, For, With } from "ags";
import Notifd from "gi://AstalNotifd"
import { interval, timeout } from "ags/time";
import { visible } from "./SystemMenu";

export default function PushNotification(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    const notifd = Notifd.get_default()

    const [notifications, setNotifications] = createState<Array<{ notification: Notifd.Notification, countdown: number }>>([])

    notifd.connect(`notified`, (_, id) =>  {
        if(!visible.peek()) {
            const notification = notifd.get_notification(id)
            setNotifications(notifications => [...notifications, { notification, countdown: 5000 }])
            const counter = interval(16, () => {
                const index = notifications.peek().findIndex(({ notification }) => notification.id === id)
                if(index === -1) {
                    counter.cancel()
                } else {
                    const { notification, countdown } = notifications.peek()[index]
                    if(countdown <= 0) {
                        setNotifications(notifications => [...notifications.slice(0, index), ...notifications.slice(index + 1)])
                        counter.cancel()
                    } else {
                        setNotifications(notifications => notifications.with(index, { notification, countdown: countdown - 16 }))
                    }
                }
            })
        }
    })

    return (
        <window
            class={`PushNotification`}
            name={`Push Notification`}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.NONE}
            application={app}
            visible={notifications.as(notifications => notifications.length > 0)}
            anchor={TOP | RIGHT}
            gdkmonitor={gdkmonitor}
            widthRequest={350}
            heightRequest={100}
            marginTop={20}
            marginRight={150}
            resizable={false}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={10}
            >
                <For each={notifications}>
                    {({ notification, countdown }, i) => (
                        <revealer
                            revealChild
                            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                        >
                            <box
                                orientation={Gtk.Orientation.VERTICAL}
                                spacing={5}
                            >
                                <Notification
                                    notification={notification}
                                    dismiss={() => setNotifications(notifications => [...notifications.slice(0, i.peek()), ...notifications.slice(i.peek() + 1)])} />
                                <levelbar
                                    class="countdown"
                                    value={countdown / 5000}
                                    hexpand />
                            </box>
                        </revealer>
                    )}
                </For>
            </box>
        </window>
    )
}