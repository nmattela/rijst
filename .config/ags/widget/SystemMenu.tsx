import app from "ags/gtk4/app"
import {Gdk, Astal, Gtk} from "ags/gtk4"
import Pango from "gi://Pango?version=1.0"
import Notifd from "gi://AstalNotifd"
import { Accessor, createBinding, createState, For, With } from "ags"
import Notification from "./Notification"
import { execAsync, subprocess } from "ags/process"
import Brightness from "../utils/Brightness"
import Wp from "gi://AstalWp"
import Bluetooth from "gi://AstalBluetooth"
import { AudioIcon, BatteryIcon, BluetoothIcon, NetworkIcon } from "./SystemTray"

export default function SystemMenu(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    const brightness = Brightness.get_default()
    const wp = Wp.get_default()
    const bluetooth = Bluetooth.get_default()

    const [speakers, setSpeakers] = createState<Array<Wp.Endpoint>>([])
    const [microphones, setMicrophones] = createState<Array<Wp.Endpoint>>([])
    wp?.connect(`endpoint-added`, (_, endpoint) => {
        if(endpoint.mediaClass === Wp.MediaClass.AUDIO_SPEAKER) {
            setSpeakers(speakers => [...speakers, endpoint])
        } else if(endpoint.mediaClass === Wp.MediaClass.AUDIO_MICROPHONE) {
            setMicrophones(microphones => [...microphones, endpoint])
        }
    })

    const currentSpeaker = speakers(speakers => {
        const speaker = speakers.find(speaker => speaker.isDefault)
        console.log(`ewa`, speakers, speaker)
        return speaker
    })
    const currentMicrophone = microphones(microphones => microphones.find(microphone => microphone.isDefault) ?? wp?.defaultMicrophone)

    console.log(`currents: `, currentSpeaker, currentMicrophone)

    currentSpeaker(console.log)

    // const audio = wp !== null ? createBinding(wp, `audio`) : undefined
    // const speakers = audio?.as(audio => {
    //     console.log(audio.speakers)
    //     return audio.speakers
    // })
    // const currentSpeaker = speakers?.as(speakers => speakers.find(speaker => speaker.isDefault))

    const volume = wp !== null ? createBinding(wp.defaultSpeaker, `volume`) : undefined
    const volumeIcon = wp !== null ? createBinding(wp.defaultSpeaker, `volumeIcon`) : undefined
    const muted = wp !== null ? createBinding(wp.defaultSpeaker, `mute`) : undefined
    const audioLabel = muted?.as(muted => muted ? `Unmute` : `Mute`)
    const audioClass = muted?.as(muted => muted ? `disabled` : ``)

    // const microphones = wp !== null ? createBinding(wp.audio, `microphones`) : undefined
    // const currentMicrophone = microphones?.as(microphones => microphones.find(microphone => microphone.isDefault))

    const micVolume = wp !== null ? createBinding(wp.defaultMicrophone, `volume`) : undefined
    const micIcon = wp !== null ? createBinding(wp.defaultMicrophone, `volumeIcon`) : undefined
    const micMuted = wp !== null ? createBinding(wp.defaultMicrophone, `mute`) : undefined
    const micLabel = micMuted?.as(muted => muted ? `Unmute` : `Mute`)
    const micClass = micMuted?.as(muted => muted ? `disabled` : ``)

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
            marginTop={20}
            marginRight={100}
            transientFor={app.get_window(`Bar`) ?? undefined}
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
            />
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={20}
            >
                <box
                    class="settings"
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={30}
                >
                    <centerbox
                        $type="start"
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
                        $type="center"
                        maxChildrenPerLine={3}
                        activateOnSingleClick={false}
                        homogeneous
                        rowSpacing={10}
                        columnSpacing={10}
                    >
                        <NetworkIcon />
                        <BluetoothIcon />
                        <AudioIcon />
                        {/* <SystemPill
                            icon={`audio-input-microphone`}
                            label={`Off`}
                            color={`#5C8984`}
                        /> */}
                        <BatteryIcon />
                        {/* <SystemPill
                            icon={`accessories-screenshot-tool`}
                            color={`#fb6f92`}
                            onClick={() => execAsync([`grimblast`, `copy`, `area`])}
                        /> */}
                    </Gtk.FlowBox>
                    <box
                        $type="end"
                        class="sliders"
                        orientation={Gtk.Orientation.VERTICAL}
                        valign={Gtk.Align.END}
                        spacing={10}
                    >
                        <box
                            class="brightness"
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={10}
                        >
                            <image class="icon" iconName={`brightness-symbolic`} />
                            <slider
                                value={brightness.screen}
                                min={0.1}
                                max={1}
                                onChangeValue={({ value }) => {
                                    brightness.screen = value
                                }}
                                visible={true}
                                hexpand
                                valuePos={Gtk.PositionType.RIGHT}
                            />
                        </box>
                        <AudioDeviceSlider
                            speakers={speakers}
                            type="audio"
                        />
                        <AudioDeviceSlider
                            speakers={microphones}
                            type="mic"
                        />
                    </box>
                </box>
                <scrolledwindow
                    heightRequest={500}
                >
                    <Notifications />
                </scrolledwindow>
            </box>
        </window>
    )
}

function AudioDeviceSlider({ speakers, type }: { speakers: Accessor<Array<Wp.Endpoint>>, type: `audio` | `mic` }) {
    
    const currentSpeaker = speakers(speakers => speakers.find(speaker => speaker.isDefault))
    const speakerName = currentSpeaker(currentSpeaker => {
        console.log(`speakerName: `, currentSpeaker, currentSpeaker?.name)
        return currentSpeaker?.name ?? ``
    })

    const volume = currentSpeaker(currentSpeaker => currentSpeaker?.volume ?? 0)
    const volumeIcon = currentSpeaker(currentSpeaker => currentSpeaker?.volumeIcon ?? ``)
    const muted = currentSpeaker(currentSpeaker => currentSpeaker?.mute ?? true)
    const audioLabel = muted(muted => muted ? `Unmute` : `Mute`)
    const audioClass = muted(muted => muted ? `disabled` : ``)

    console.log(currentSpeaker)
    
    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={5}
            class="sliderbox"
        >
            <menubutton
                hexpand
                vexpand
            >                                                
                    <box
                        halign={Gtk.Align.CENTER}
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={5}
                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    >
                        <label label={speakerName} />
                        <image iconName={`go-down`} />
                    </box>
                    <popover>
                        <For each={speakers} id={speaker => speaker.id}>
                            {speaker => (
                                <box class={speaker.isDefault ? `selected` : undefined}>
                                    {speaker.name}
                                </box>
                            )}
                        </For>
                    </popover>
            </menubutton>
            <box
                class={type}
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={10}
            >
                <button
                    class={`icon hover-bg`}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                    tooltipText={audioLabel}
                    onClicked={() => {
                        currentSpeaker(currentSpeaker => currentSpeaker?.set_mute(!muted))
                    }}
                >
                    <image iconName={volumeIcon} />
                </button>
                <slider
                    class={audioClass}
                    value={volume}
                    min={0}
                    max={1}
                    onChangeValue={({ value }) => {
                        currentSpeaker(currentSpeaker => currentSpeaker?.set_volume(value))
                    }}
                    visible={true}
                    hexpand
                    valuePos={Gtk.PositionType.RIGHT}

                />
            </box>
        </box>
    )
}

function Notifications() {
    const notifd = Notifd.get_default()


    const [notifications, setNotifications] = createState<Array<Notifd.Notification>>(notifd.notifications)

    notifd.connect(`notified`, (_, id) => {
        const notification = notifd.get_notification(id)
        setNotifications(notifications => [...notifications, notification])
    })

    return (
        <box
            class="notifications"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={10}
        >
            <centerbox
                class="header"
            >
                <label
                    $type="start"
                    label={notifications.as(notifications => notifications.length !== 0 ? `Notifications` : `No notifications right now`)}
                />
                <button
                    $type="end"
                    class="clear-button"
                    label={`Clear All`}
                    onClicked={() => {
                        notifications.get().forEach(notification => notification.dismiss())
                        setNotifications([])
                    }}
                    visible={notifications.as(notifications => notifications.length !== 0)}
                    cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                />
            </centerbox>
            <For each={notifications}>
                {notification => (
                    <Notification
                        notification={notification}
                        dismiss={() => setNotifications(notifications => notifications.filter(n => n.id !== notification.id))}
                    />
                )}
            </For>
        </box>
    )
}