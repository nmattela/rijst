import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Notification from "./Notification";
import { createState, With } from "ags";
import Notifd from "gi://AstalNotifd"
import { interval, timeout } from "ags/time";

export default function PushNotification(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    const notifd = Notifd.get_default()

    const [notification, setNotification] = createState<Notifd.Notification | undefined>(undefined)
    const [countdown, setCountdown] = createState(0)
    
    notifd.connect(`notified`, (_, id) => {
        console.log(`notified!`)
        if(!app.get_window(`System Menu`)?.visible) {
            const notification = notifd.get_notification(id)
            setNotification(notification)
            setCountdown(5000)
            const counter = interval(16, () => {
                if(countdown.get() <= 0) {
                    setNotification(undefined)
                    counter.cancel()
                } else {
                    setCountdown(countdown => countdown - 16)
                }
            })
        }
    })

    return (
        <window
            class={`PushNotification`}
            name={`Push Notification`}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.ON_DEMAND}
            application={app}
            visible={notification.as(notification => notification !== undefined)}
            anchor={TOP | RIGHT}
            gdkmonitor={gdkmonitor}
            widthRequest={350}
            heightRequest={100}
            marginTop={20}
            marginRight={150}
        >
            <revealer
                revealChild={notification.as(notification => notification !== undefined)}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            >
                <With value={notification}>
                    {notification => notification !== undefined && (
                        <box
                            orientation={Gtk.Orientation.VERTICAL}
                            spacing={5}
                        >
                            <Notification
                                notification={notification}
                                dismiss={() => null}
                            />
                            <levelbar
                                class="countdown"
                                value={countdown.as(countdown => countdown / 5000)}
                                hexpand
                            />
                        </box>
                    )}
                </With>
            </revealer>
        </window>
    )
}