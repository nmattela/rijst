import { Astal, Gdk, Gtk } from "ags/gtk4"
import { Accessor, createBinding, createComputed, createState, For, With } from "ags"
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


export default function SystemTray() {
    
    const tray = Tray.get_default()

    const trayItems = createBinding(tray, `items`).as(items => items.filter(item => item.title !== ``))

    return (
        <box
            class="SystemTray"
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
            spacing={5}
        >
            <box>
                <For each={trayItems}>
                {trayItem => (
                        <TrayIcon
                            item={trayItem}
                        />
                )} 
                </For>
            </box>
            <box><NetworkIcon small /></box>
            <box><BluetoothIcon small /></box>
            <box><AudioIcon small /></box>
            <box><BatteryIcon small /></box>
            <box><ExpandButton /></box>
        </box>
    )
}

export function NetworkIcon({ small = false }: { small?: boolean }) {
    const network = Network.get_default()

    const primary = createBinding(network, `primary`)
    const connected = primary.as(primary => primary !== Network.Primary.UNKNOWN)
    const label = primary.as(primary => {
        switch(primary) {
            case Network.Primary.WIRED: return network.wired.device.activeConnection.id
            case Network.Primary.WIFI: return network.wifi.ssid
            default: return `Not connected`
        }
    })
    const icon = primary.as(primary => {
        switch(primary) {
            case Network.Primary.WIRED: return network.wired.iconName
            case Network.Primary.WIFI: return network.wifi.iconName
            default: return `network-offline`
        }
    })
    const className = primary.as(primary => {
        switch(primary) {
            case Network.Primary.UNKNOWN: `icon network`
            default: return `icon network network-connected`
        }
    })

    // const icon = createBinding(network, `wifi`).as(wifi => createBinding(network, `wired`).as(wired => {
    //     if(wifi !== null) {
    //         return (
    //             <image
    //                 tooltipText={wifi.ssid}
    //                 class="icon network network-connected"
    //                 iconName={wifi.iconName}
    //             />
    //         )
    //     } else if(wired !== null) {
    //         return (
    //             <image
    //                 tooltipText={wired.speed.toString()}
    //                 class="icon network network-connected"
    //                 iconName={wired.iconName}
    //             />
    //         )
    //     } else {
    //         return (
    //             <image
    //                 tooltipText="Not connected"
    //                 class="icon network"
    //                 iconName={`network-wireless`}
    //             />
    //         )
    //     }
    // }))

    if(small) {
        return (
            <button
                widthRequest={30}
                onClicked={() => apps.fuzzy_query("nmtui").at(0)?.launch()}
                cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
            >
                <image
                    tooltipText={label}
                    class={className}
                    iconName={icon}
                />
            </button>
        )
    } else {
        return (
            <SystemPill
                icon={icon}
                label={label}
                color={`#FAAB78`}
                onClick={() => execAsync([`kitty`, `nmtui`])}
                active={connected}
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
                        active={isPowered}
                    />
                )).get()}
            </With>
        )
    }

}

export function AudioIcon({ small = false }: { small?: boolean }) {
    const audio = Wp.get_default()!
    const defaultSpeaker = audio?.audio.defaultSpeaker

    const volume = audio !== null ? createBinding(audio.defaultSpeaker, `volume`) : undefined
    const volumeIcon = audio !== null ? createBinding(audio.defaultSpeaker, `volumeIcon`) : undefined
    const muted = audio !== null ? createBinding(audio.defaultSpeaker, `mute`) : undefined

    const label = createComputed([volume ?? new Accessor(() => undefined), muted ?? new Accessor(() => undefined)]).as(([volume, muted]) => muted ? `Muted` : `${Math.round((volume ?? 0) * 100)}%`)
    // const label = sequence({ volume: volume ?? new Accessor(() => undefined), muted: muted ?? new Accessor(() => undefined) }).as(({ volume, muted }) => muted ? `Muted` : `${Math.round((volume ?? 0) * 100)}%`)

    const name = createBinding(audio.defaultSpeaker, `name`)
    const tooltipText = (label ?? new Accessor(() => undefined)).as(label => (name ?? new Accessor(() => undefined)).as(name => `${name}${label !== undefined ? `- ${label}` : ``}`).get())

    const className = muted?.(muted => audio === null || defaultSpeaker === undefined
        ? `icon audio`
        : `icon audio ${!muted ? `audio-enabled` : ``}`
    )

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
            <With value={muted ?? new Accessor(() => false)}>
                {muted => (
                    <SystemPill
                        icon={volumeIcon ?? ``}
                        label={label}
                        color={`#5C8984`}
                        onClick={() => execAsync(`pavucontrol`)}
                        active={!muted}
                    />
                )}
            </With>
        )
    }
}

export function MicrophoneIcon({ small = false }: { small?: boolean }) {
    const audio = Wp.get_default()
    const defaultMicrophone = audio?.audio.defaultMicrophone

    const volume = audio !== null ? createBinding(audio.defaultMicrophone, `volume`) : undefined
    const volumeIcon = audio !== null ? createBinding(audio.defaultMicrophone, `volumeIcon`) : undefined
    const muted = audio !== null ? createBinding(audio.defaultMicrophone, `mute`) : undefined

    const label = volume?.as(volume => muted?.as(muted => muted ? `Muted` : `${Math.round(volume * 100)}%`).get() ?? ``)

    const tooltipText = audio === null || defaultMicrophone === undefined
        ? `No microphone found`
        : `${defaultMicrophone.name} - ${defaultMicrophone.volume}%`

    const className = muted?.(muted => audio === null || defaultMicrophone === undefined
        ? `icon micro`
        : `icon micro ${!muted ? `micro-enabled` : ``}`
    )

    if(small) {
        return (
            <button
                tooltipText={tooltipText}
                class={className}
                widthRequest={30}
                onClicked={() => execAsync(`pavucontrol`)}
                cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
            >
                <image
                    iconName={volumeIcon}
                />
            </button>
        )
    } else {
        return (
            <With value={muted ?? new Accessor(() => false)}>
                {muted => (
                    <SystemPill
                        icon={volumeIcon ?? ``}
                        label={label}
                        color={`#B5B682`}
                        onClick={() => execAsync(`pavucontrol`)}
                        active={!muted}
                    />
                )}
            </With>
        )
    }
}

export function BatteryIcon({ small = false }: { small?: boolean }) {
    const battery = Battery.get_default()

    const iconName = createBinding(battery, `iconName`)
    const label = createBinding(battery, `batteryLevel`).as(b => `${b*100}%${battery.charging ? ` - Charging` : ``}`)

    if(!battery.isPresent) {
        return (
            <></>
        )
    }

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
            iconName={item.iconName}
            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
            tooltipText={item.title}
            onClicked={() => item.activate(0, 0)}
            label={item.iconName === `` ? item.title.at(0)?.toUpperCase() : undefined}
            tooltipMarkup={item.tooltipMarkup}
        />
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


function SystemPill({ icon, label, color, onClick, active = false }: { icon: string | Accessor<string>, label?: string | Accessor<string>, color: string, onClick?: () => void, active?: boolean | Accessor<boolean> }) {

    return (
        <button
            class={`pill ${onClick !== undefined ? `clickable` : ``}`}
            css={active ? `background: ${color};` : undefined}
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