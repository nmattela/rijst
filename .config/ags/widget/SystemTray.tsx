import { Gdk, Gtk } from "ags/gtk4"
import { Accessor, createBinding, createState, With } from "ags"
import Network from "gi://AstalNetwork"
import Bluetooth from "gi://AstalBluetooth"
import Wp from "gi://AstalWp"
import Battery from "gi://AstalBattery"
import Apps from "gi://AstalApps"
import app from "ags/gtk4/app"
import Tray from "gi://AstalTray"
import SystemMenu from "./SystemMenu"
import Notification from "./Notification"
import { execAsync } from "ags/process"
import Pango from "gi://Pango"

const apps = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
})

const tray = Tray.get_default()

export default function SystemTray() {

    return (
        <box
            class="SystemTray"
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
            spacing={5}
        >
            <NetworkIcon small />
            <BluetoothIcon small />
            <AudioIcon small />
            <BatteryIcon small />
            {
                tray.get_items().map(item => <TrayIcon item={item}></TrayIcon>)
            }
            <ExpandButton />
        </box>
    )
}

export function NetworkIcon({ small = false }: { small?: boolean }) {
    const network = Network.get_default()
    const wifi = createBinding(network, `wifi`)
    const wired = createBinding(network, `wired`)
    const isWifi = createBinding(network, `get_wifi`).as(v => v !== null).get()
    const isWired = createBinding(network, `get_wired`).as(v => v !== null).get()

    const icon = createBinding(network, `wifi`).as(wifi => createBinding(network, `wired`).as(wired => {
        if(wifi !== null) {
            return (
                <image
                    tooltipText={wifi.ssid}
                    class="icon network network-connected"
                    iconName={wifi.iconName}
                />
            )
        } else if(isWired) {
            return (
                <image
                    tooltipText={wired.speed.toString()}
                    class="icon network network-connected"
                    iconName={wired.iconName}
                />
            )
        } else {
            return (
                <image
                    tooltipText="Not connected"
                    class="icon network"
                    iconName={`network-wireless`}
                />
            )
        }
    }))

    if(small) {
        return (
            <button
                widthRequest={30}
                onClicked={() => apps.fuzzy_query("nmtui").at(0)?.launch()}
                cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
            >
                <With value={icon}>
                    {(icon) => icon.get()}
                </With>
            </button>
        )
    } else {
        return (
            <SystemPill
                icon={`network-wireless`}
                label={`Klarrio Guest`}
                color={`#FAAB78`}
                onClick={() => execAsync([`kitty`, `nmtui`])}
            />
        )
    }

    
}

export function BluetoothIcon({ small = false }: { small?: boolean }) {
    const bluetooth = Bluetooth.get_default()
    const devices = createBinding(bluetooth, `devices`).as(devices => devices.filter(device => device.connected))
    const label = devices.as(devices => (
        devices.length === 0
            ? `No devices connected`
            : devices.length === 1
                ? devices[0].name
                : `${devices.length} devices connected`
    ))
    const isPowered = createBinding(bluetooth, `isPowered`)
    const bluetoothIcon = devices.as(devices => isPowered.as(isPowered => (
        isPowered && devices.length === 0
            ? /*`󰂯`*/`bluetooth-on-symbolic`
            : isPowered && devices.length === 1
                ? devices.at(0)?.icon ?? `bluetooth-connected-symbolic`
                : isPowered && devices.length > 1
                    ? /*`󰂱`*/`bluetooth-connected-symbolic`
                    : /*`󰂲`*/`bluetooth-off-symbolic`
    )).get())

    if(small) {
        return (
            <With value={devices}>
                {devices => (
                    <button
                        iconName={bluetoothIcon}
                        tooltipText={label}
                        class={`icon bluetooth ${devices.length > 0 ? `bluetooth-enabled` : ``}`}
                        widthRequest={30}
                        onClicked={() => apps.fuzzy_query("bluetooth").at(0)?.launch()}
                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    />
                )}
            </With>
        )
    } else {
        return (
            <With value={bluetoothIcon}>
                {bluetoothIcon => label.as(bluetoothLabel => (
                    <SystemPill
                        icon={bluetoothIcon}
                        label={bluetoothLabel}
                        color={`#0083fc`}
                        onClick={() => execAsync(`blueberry`)}
                    />
                )).get()}
            </With>
        )
    }

}

export function AudioIcon({ small = false }: { small?: boolean }) {
    const audio = Wp.get_default()
    const defaultSpeaker = audio?.audio.defaultSpeaker

    const volume = audio !== null ? createBinding(audio.defaultSpeaker, `volume`) : undefined
    const volumeIcon = audio !== null ? createBinding(audio.defaultSpeaker, `volumeIcon`) : undefined
    const muted = audio !== null ? createBinding(audio.defaultSpeaker, `mute`) : undefined

    const label = volume?.as(volume => muted?.as(muted => muted ? `Muted` : `${Math.round(volume * 100)}%`).get() ?? ``)

    const tooltipText = audio === null || defaultSpeaker === undefined
        ? `No audio device found`
        : `${defaultSpeaker.name} - ${defaultSpeaker.volume}%`

    const className = audio === null || defaultSpeaker === undefined
        ? `icon audio`
        : `icon audio ${!defaultSpeaker.mute ? `audio-enabled` : ``}`

        if(small) {
            return (
                <button
                    tooltipText={tooltipText}
                    class={className}
                    widthRequest={30}
                    onClicked={() => apps.fuzzy_query("pavucontrol").at(0)?.launch()}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                >
                    <image
                        iconName={volumeIcon}
                    />
                </button>
            )
        } else {
            return (
                <SystemPill
                    icon={volumeIcon ?? ``}
                    label={label}
                    color={`#5C8984`}
                    onClick={() => execAsync(`pavucontrol`)}
                />
            )
        }
    

    // if(audio === null) {
    //     return (
    //         <button
    //             tooltipText={`No audio device found`}
    //             class={`icon audio`}
    //             widthRequest={30}
    //             onClicked={() => apps.fuzzy_query("pavucontrol").at(0)?.launch()}
    //         >
    //             
    //         </button>
    //     )
    // } else {        
    //     const defaultSpeaker = createBinding(audio, `audio`).as(audio => audio.get_default_speaker())
    //     return defaultSpeaker.as(defaultSpeaker => {
    //         if(defaultSpeaker === null) {
    //             return (
    //                 <button
    //                     tooltipText={`No audio device found`}
    //                     class={`icon audio`}
    //                     onClicked={() => apps.fuzzy_query("pavucontrol").at(0)?.launch()}
    //                 >
    //                     
    //                 </button>
    //             )
    //         } else {
    //             return (
    //                 <button
    //                     tooltipText={defaultSpeaker !== null ? `${defaultSpeaker.name} - ${defaultSpeaker.volume}%` : `No audio device found`}
    //                     class={`icon audio ${!defaultSpeaker.mute ? `audio-enabled` : ``}`}
    //                     onClicked={() => apps.fuzzy_query("pavucontrol").at(0)?.launch()}
    //                 >
    //                     <label
    //                         label={defaultSpeaker.volumeIcon}
    //                     />
    //                 </button>
    //             )
    //         }
    //     })
    // }

}

export function BatteryIcon({ small = false }: { small?: boolean }) {
    const battery = Battery.get_default()

    const iconName = createBinding(battery, `iconName`)
    const label = createBinding(battery, `batteryLevel`).as(b => `${b*100}%${battery.charging ? ` - Charging` : ``}`)

    if(small) {
        return (
            <button
                tooltipText={label}
                class={createBinding(battery, `charging`).as(charging => `icon battery ${charging ? `battery-charging` : ``}`)}
                widthRequest={30}
            >
                <image
                    iconName={iconName}
                />
            </button>
        )
    } else {
        return (
            <SystemPill
                icon={iconName}
                label={label}
                color={`#FFD966`}
            />
        )
    }

}

function TrayIcon({ item }: { item: Tray.TrayItem }) {
    return (
        <button
            class={`icon`}
        >
            { item.title }
        </button>
    )
}

function ExpandButton() {

    const [open, setOpen] = createState(app.get_window(`System Menu`)?.visible ?? false)
    app.connect(`window-toggled`, (source, window) => {
        if(window.name === `System Menu`) {
            setOpen(window.visible)
        }
    })

    return (
        <button
            tooltipText={`Open drawer`}
            class={`icon hover-fg`}
            widthRequest={30}
            onClicked={() => {
                app.toggle_window(`System Menu`)
            }}
            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
        >
            {/*󰍝*/}
            <With value={open}>
                {open => (
                    <image
                        iconName={open ? `go-up` : `go-down`}
                    />
                )}
            </With>
        </button>
    )
}


function SystemPill({ icon, label, color, onClick }: { icon: string | Accessor<string>, label?: string | Accessor<string>, color: string, onClick?: () => void }) {

    return (
        <button
            class={`pill ${onClick !== undefined ? `clickable` : ``}`}
            css={`background: ${color};`}
            widthRequest={120}
            heightRequest={60}
            cursor={onClick !== undefined ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
            tooltipText={label}
            onClicked={onClick}
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