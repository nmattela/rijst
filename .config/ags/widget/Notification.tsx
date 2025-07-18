import {Gdk, Astal, Gtk} from "ags/gtk4"
import Notifd from "gi://AstalNotifd"
import GLib from "gi://GLib?version=2.0"
import Pango from "gi://Pango"

export default function Notification({ notification, dismiss }: { notification: Notifd.Notification, dismiss: () => void }) {

    return (
        <box
            class="notification"
            heightRequest={100}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
        >
            <centerbox
                valign={Gtk.Align.START}
                class="header"
                hexpand
            >
                <box
                    $type="start"
                    spacing={10}
                >
                    <image
                        iconName={notification.appIcon ? notification.appIcon : `bell-notification-symbolic`}
                    />
                    <label
                        maxWidthChars={60}
                        label={notification.summary}
                        class="summary"
                        ellipsize={Pango.EllipsizeMode.END}
                    />
                </box>
                <box
                    $type="end"
                    spacing={10}
                >
                    <label label={GLib.DateTime.new_from_unix_local(notification.time).format(`%H:%M:%S`)!} />
                    <button
                        class={`icon hover-fg`}
                        onClicked={() => {
                            notification.dismiss()
                            dismiss()
                        }}
                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    >
                        <image
                            iconName={`window-close`}
                        />
                    </button>
                </box>
            </centerbox>
            <button
                class="body"
                onClicked={(source) => {
                    const actionId = notification.actions.at(0)?.id
                    if(actionId !== undefined) {
                        notification.invoke(actionId)
                    }
                }}
            >
                <box>
                    <image
                        file={notification.image}
                    />
                    <label
                        maxWidthChars={60}
                        label={notification.body}
                        wrap
                        // naturalWrapMode={Gtk.NaturalWrapMode.WORD}
                        // ellipsize={Pango.EllipsizeMode.MIDDLE}
                        // wrapMode={Gtk.WrapMode.WORD}
                    />
                </box>
            </button>
        </box>
    )
}