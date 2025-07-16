import { Gtk } from "ags/gtk4"
import { createBinding, createState, With } from "ags"
import Network from "gi://AstalNetwork"
import Bluetooth from "gi://AstalBluetooth"
import Wp from "gi://AstalWp"
import Battery from "gi://AstalBattery"
import Apps from "gi://AstalApps"
import app from "ags/gtk4/app"
import Tray from "gi://AstalTray"
import SystemMenu from "./SystemMenu"

const apps = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
})

const tray = Tray.get_default()

export default function SystemTray() {
    return (
        <>
        <box
            class="SystemTray"
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
            spacing={5}
        >
            <NetworkIcon />
            <BluetoothIcon />
            <AudioIcon />
            <BatteryIcon />
            {
                tray.get_items().map(item => <TrayIcon item={item}></TrayIcon>)
            }
            <ExpandButton />
        </box>
        </>
    )
}

function NetworkIcon() {
    const network = Network.get_default()
    const wifi = createBinding(network, `wifi`)
    const wired = createBinding(network, `wired`)
    const isWifi = createBinding(network, `get_wifi`).as(v => v !== null).get()
    const isWired = createBinding(network, `get_wired`).as(v => v !== null).get()

    const icon = createBinding(network, `wifi`).as(wifi => createBinding(network, `wired`).as(wired => {
        console.log(wifi, wired)
        if(wifi !== null) {
            return (
                <image
                    tooltipText={wifi.ssid}
                    class="icon network network-connected"
                    iconName={wifi.iconName}
                />
            )
        } else if(isWired) {
            console.log(wired.iconName)
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

    return (
        <button
            widthRequest={30}
            onClicked={() => apps.fuzzy_query("nmtui").at(0)?.launch()}
        >
            <With value={icon}>
                {(icon) => icon.get()}
            </With>
        </button>
    )
    
}

function BluetoothIcon() {
    const bluetooth = Bluetooth.get_default()
    const devices = createBinding(bluetooth, `devices`).as(devices => devices.filter(device => device.connected))
    const tooltipText = devices.as(devices => (
        devices.length === 0
            ? `No devices connected`
            : devices.length === 1
                ? devices[0].name
                : `${devices.length} devices connected`
    ))
    const bluetoothIcon = devices.as(devices => (
        bluetooth.isPowered && devices.length === 0
            ? `󰂯`
            : bluetooth.isPowered && devices.length > 0
                ? `󰂱`
                : `󰂲`
    ))

    return (
        <button
            label={bluetoothIcon}
            tooltipText={tooltipText}
            class={devices.as(devices => `icon bluetooth ${devices.length > 0 ? `bluetooth-enabled` : ``}`)}
            widthRequest={30}
            onClicked={() => apps.fuzzy_query("bluetooth").at(0)?.launch()}
        />
    )
}

function AudioIcon() {
    const audio = Wp.get_default()
    const defaultSpeaker = audio?.audio.defaultSpeaker

    const tooltipText = audio === null || defaultSpeaker === undefined
        ? `No audio device found`
        : `${defaultSpeaker.name} - ${defaultSpeaker.volume}%`

    const className = audio === null || defaultSpeaker === undefined
        ? `icon audio`
        : `icon audio ${!defaultSpeaker.mute ? `audio-enabled` : ``}`

    const label = audio === null || defaultSpeaker === undefined
        ? `audio-volume-muted`
        : defaultSpeaker.icon
    print(label)
    
    return (
        <button
            tooltipText={tooltipText}
            class={className}
            widthRequest={30}
            onClicked={() => apps.fuzzy_query("pavucontrol").at(0)?.launch()}
        >
            <image
                iconName={label}
            />
        </button>
    )

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

function BatteryIcon() {
    const battery = Battery.get_default()

    return (
        <button
            tooltipText={createBinding(battery, `batteryLevel`).as(b => `${b*100}%${battery.charging ? ` - Charging` : ``}`)}
            class={createBinding(battery, `charging`).as(charging => `icon battery ${charging ? `battery-charging` : ``}`)}
            widthRequest={30}
        >
            <image
                iconName={createBinding(battery, `iconName`)}
            />
        </button>
    )
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
    return (
        <button
            tooltipText={`Open drawer`}
            class={`icon`}
            widthRequest={30}
            onClicked={() => {
                app.toggle_window(`System Menu`)
            }}
        >
            󰍝
        </button>
    )
}