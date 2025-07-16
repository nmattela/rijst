import app from "ags/gtk4/app"
import {Gdk, Astal, Gtk} from "ags/gtk4"
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
            marginRight={100}
            // onButtonPressEvent={(window, event) => {
            //     console.log(`slorp`, event)
            //     if(event.button === Gdk.KEY_Escape) {
            //         window.hide()
            //     }
            // }}
            // onKeyPressEvent={(self, event) => {
            //     console.log(`yuuu`, event.string, Gdk.KEY_Escape)
            //     self.hide()
            //     if (event.keyval === Gdk.KEY_Escape) {
            //     }
            //   }}
            >
            <Gtk.EventControllerKey
                onKeyPressed={({ widget }, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
                        widget.hide()
                    }
                }}
            >

            </Gtk.EventControllerKey>
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
                <Gtk.FlowBox
                    maxChildrenPerLine={3}
                    activateOnSingleClick={false}
                    homogeneous
                    rowSpacing={10}
                    columnSpacing={10}
                >
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
                </Gtk.FlowBox>
                <box class="sliders" heightRequest={100}>
                    <label label="bruh" />
                    <slider
                        value={0.5}
                        min={0}
                        max={1}
                        onChangeValue={({ value }) => print(value)}
                    />
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
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={5}
            >
                <image
                    halign={Gtk.Align.START}
                    iconName={icon}
                />
                {label !== undefined && label !== `` && (
                    <label
                        halign={Gtk.Align.END}
                        label={label}
                        useMarkup
                        wrap
                        ellipsize={Pango.EllipsizeMode.END}
                    />
                )}
            </box>
        </button>
    )
}