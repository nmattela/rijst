import app from "ags/gtk4/app"
import Apps from "gi://AstalApps"
import Proc from "../utils/Proc"
import { createBinding, createState, For, With } from "ags"
import { Astal, Gdk, Gtk } from "ags/gtk4"
import Df from "../utils/Df"
import { CircularProgress } from "../utils/CircularProgress"
import UserDetails from "../utils/UserDetails"
import GLib from "gi://GLib?version=2.0"
import WeatherView from "./WeatherView"
import { timeout } from "ags/time"

const home = GLib.getenv(`HOME`)

const appsClient = new Apps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 0,
    executableMultiplier: 2,
  })

export default function Desktop(gdkmonitor: Gdk.Monitor) {
    
    const userDetails = UserDetails.get_default()
    const proc = Proc.get_default()
    const df = Df.get_default()

    const disks = createBinding(df, `disks`).as(disks => disks.filter(disk => disk.filesystem.startsWith(`/dev/s`) && disk.mounted_on !== `/boot`).toSorted((a, b) => a.filesystem.localeCompare(b.filesystem)))
    const disk = createBinding(df, `disk`)
    const meminfo = createBinding(proc, `meminfo`)
    const stat = createBinding(proc, `stat`)
    const fullName = createBinding(userDetails, `fullname`)
    const image = createBinding(userDetails, `image`)

    const day = GLib.DateTime.new_now_local().format(`%A`)
    const date = GLib.DateTime.new_now_local().format(`%F`)

    const [revealGreeter, setRevealGreeter] = createState(false)
    timeout(2000, () => setRevealGreeter(true))

    revealGreeter.subscribe(() => console.log(`revealGReeter changed state to ${revealGreeter}`))

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
                <centerbox
                    orientation={Gtk.Orientation.HORIZONTAL}
                    $type="start"
                >
                    <box
                        $type="start"
                        class="greet"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={10}
                    >
                        <box
                            class="title"
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={20}
                        >
                            <With value={image}>
                                {image => (
                                    image !== undefined
                                        ? (
                                            <image
                                                class="profile-picture"
                                                file={`${home}/.face`}
                                                pixelSize={50}
                                            />
                                        )
                                        : <box></box>
                                )}
                            </With>
                            <With value={fullName}>
                                {fullName => (
                                    <label
                                        label={`Welcome, ${fullName}`}
                                    />
                                )}
                            </With>
                        </box>
                        <box
                            class="body"
                        >
                            {
                                day !== null && date !== null
                                    ? (
                                        <box
                                            orientation={Gtk.Orientation.HORIZONTAL}
                                            spacing={10}
                                        >
                                            <label label={`It is`} />
                                            <label class="day" label={day} />
                                            <label class="date" label={date} />
                                        </box>
                                    )
                                    : <></>
                            }
                        </box>
                    </box>
                </centerbox>
                <centerbox
                    $type="center"
                >
                    <box
                        $type="start"
                        halign={Gtk.Align.START}
                        widthRequest={590}
                    >
                        <WeatherView />
                    </box>
                </centerbox>
                <centerbox
                    $type="end"
                >
                    <box
                        $type="center"
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
                        <With value={disk}>
                            {disk => (
                                disk !== undefined
                                    ? (
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
                                                value={disk.use_percent / 100}
                                                hexpand
                                                valign={Gtk.Align.CENTER}
                                            />
                                            <label
                                                label={`${disk.use_percent}%`}
                                            />
                                        </box>
                                    )
                                    : <box></box>
                            )}
                        </With>
                    </box>
                    <box
                        $type="end"
                    >
                        <Gtk.FlowBox
                            maxChildrenPerLine={4}
                            rowSpacing={20}
                            columnSpacing={20}
                        >
                            <For each={disks}>
                                {(disk) => (
                                    <CircularProgress
                                        label={disk.filesystem.replaceAll(`/dev/`, ``)}
                                        progress={disk.use_percent / 100}
                                        thickness={5}
                                        color={`#fec89a`}
                                        fontSize={12}
                                        size={75}
                                    />
                                )}
                            </For>
                        </Gtk.FlowBox>
                    </box>
                </centerbox>
            </centerbox>
        </window>
    )
}