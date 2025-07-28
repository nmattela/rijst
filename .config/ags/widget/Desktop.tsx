import app from "ags/gtk4/app"
import Apps from "gi://AstalApps"
import Proc from "../utils/Proc"
import { createBinding } from "ags"
import { Astal, Gdk, Gtk } from "ags/gtk4"

const appsClient = new Apps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 0,
    executableMultiplier: 2,
  })

export default function Desktop(gdkmonitor: Gdk.Monitor) {
    
    const proc = Proc.get_default()

    const meminfo = createBinding(proc, `meminfo`)
    const stat = createBinding(proc, `stat`)

    meminfo.subscribe(() => console.log((meminfo.get().MemTotal - meminfo.get().MemFree) / meminfo.get().MemTotal))
    console.log(meminfo)

    return (
        <window
            class="Desktop"
            name={`Desktop`}
            gdkmonitor={gdkmonitor}
            layer={Astal.Layer.BACKGROUND}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
            application={app}
            visible={true}
            vexpand
            hexpand
            heightRequest={1440}
        >
            <centerbox
                orientation={Gtk.Orientation.VERTICAL}
                hexpand
                vexpand
            >
                <box
                    $type="end"
                    class="Metrics"
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    widthRequest={500}
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={5}
                >
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                    >
                        <image
                            iconName={`memory-symbolic`}
                        />
                        <levelbar
                            class="gauge memory"
                            value={meminfo.as(info => (info.MemTotal - info.MemAvailable) / info.MemTotal)}
                            hexpand
                            valign={Gtk.Align.CENTER}
                        />
                        <label
                            label={meminfo.as(info => `${Math.round(((info.MemTotal - info.MemAvailable) / info.MemTotal) * 100)}%`)}
                        />
                    </box>
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                    >
                        <image
                            iconName={`processor-symbolic`}
                        />
                        <levelbar
                            $type="center"
                            class="gauge cpu"
                            value={stat.as(() => proc.cpu())}
                            hexpand
                            valign={Gtk.Align.CENTER}
                        />
                        <label
                            label={stat.as(() => `${Math.round(proc.cpu() * 100)}%`)}
                        />
                    </box>
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                    >
                        <image
                            iconName={`drive-harddisk-ieee1394-symbolic`}
                        />
                        <levelbar
                            $type="end"
                            class="gauge disk"
                            value={meminfo.as(info => (info.MemTotal - info.MemFree) / info.MemTotal)}
                            hexpand
                            valign={Gtk.Align.CENTER}
                        />
                        <label
                            label={meminfo.as(info => `${Math.round(((info.MemTotal - info.MemFree) / info.MemTotal) * 100)}%`)}
                        />
                    </box>
                </box>
            </centerbox>
        </window>
    )
}