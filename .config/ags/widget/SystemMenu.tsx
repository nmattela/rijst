import app from "ags/gtk3/app"
import {Gdk, Astal, Gtk} from "ags/gtk3"
import Pango from "gi://Pango?version=1.0"

export default function SystemMenu(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor
    
    return (
        <window
            class={`SystemMenu`}
            name={`System Menu`}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
            application={app}
            anchor={TOP | RIGHT}
            gdkmonitor={gdkmonitor}
            visible={true}
            widthRequest={400}
            marginRight={50}
            onButtonPressEvent={(window, event) => {
                console.log(`slorp`, event)
                if(event.button === Gdk.KEY_Escape) {
                    window.hide()
                }
            }}
            onKeyPressEvent={(self, event) => {
                console.log(`yuuu`, event.string, Gdk.KEY_Escape)
                self.hide()
                if (event.keyval === Gdk.KEY_Escape) {
                }
              }}
            >
            {/* <Gtk.EventControllerKey
                onKeyPressed={({ widget }, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
                        widget.hide()
                    }
                }}
            >

            </Gtk.EventControllerKey> */}
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={10}
            >
                <centerbox
                    class="header"
                    orientation={Gtk.Orientation.HORIZONTAL}
                >
                    <label
                        $type="start"
                        label="Quick Settings"
                        halign={Gtk.Align.START}
                    />
                    <button
                        $type="end"
                        label=""
                        halign={Gtk.Align.END}
                    >
                    </button>
                </centerbox>
                <box
                    class="pills"
                    spacing={10}
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
                        <SystemPill
                            icon={`network-wireless`}
                            label={`Klarrio Guest`}
                            color={`#FAAB78`}
                        />
                        <SystemPill
                            icon={`󰂯`}
                            label={`WH-1000XM6`}
                            color={`#0083fc`}
                        />
                        <SystemPill
                            icon={`audio-volume-muted`}
                            label={`87%`}
                            color={`#5C8984`}
                        />
                    </box>
                    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
                        <SystemPill
                            icon={`audio-input-microphone`}
                            label={`Off`}
                            color={`#5C8984`}
                        />
                        <SystemPill
                            icon={`battery`}
                            label={`42% - Charging`}
                            color={`#FFD966`}
                        />
                        <SystemPill
                            icon={`accessories-screenshot-tool`}
                            color={`#fb6f92`}
                        />
                    </box>
                </box>
            </box>
        </window>
    )
}

function SystemPill({ icon, label, color }: { icon: string, label?: string, color: string }) {

    return (
        <button
            class="pill"
            css={`background: ${color};`}
            widthRequest={120}
            heightRequest={60}
        >
            <centerbox
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={5}
            >
                <icon
                    $type="start"
                    icon={icon}
                />
                {label !== undefined && label !== `` && (
                    <label
                        $type="end"
                        label={label}
                        ellipsize={Pango.EllipsizeMode.END}
                    />
                )}
            </centerbox>
        </button>
    )
}