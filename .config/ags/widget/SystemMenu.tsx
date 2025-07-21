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
import { AudioIcon, BatteryIcon, BluetoothIcon, MicrophoneIcon, NetworkIcon } from "./SystemTray"
import GObject from "gi://GObject?version=2.0"
import GLib from "gi://GLib"
import MediaPlayer from "./MediaPlayer"
import WeatherView from "./WeatherView"

export default function SystemMenu(gdkmonitor: Gdk.Monitor) {
    const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

    const brightness = Brightness.get_default()

    const [visible, setVisible] = createState(false)
    app.connect(`window-toggled`, (_, window) => {
        window.name === `System Menu` ? setVisible(window.visible) : null
    })

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
            <revealer
                revealChild={visible}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            >
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={20}
                >
                    <box
                        widthRequest={500}
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={20}
                        valign={Gtk.Align.START}
                    >
                        <box hexpand>
                            <WeatherView />
                        </box>
                        <box hexpand>
                            <MediaPlayer />
                        </box>
                    </box>
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
                                <box
                                    $type="end"
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    spacing={5}
                                >
                                    <button
                                        class={`icon hover-bg`}
                                        tooltipText={`Screenshot`}
                                        iconName={`screenshot-symbolic`}
                                        onClicked={() => {
                                            app.get_window(`System Menu`)?.hide()
                                            execAsync([`grimblast`, `copy`, `area`])
                                        }}
                                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                                    />
                                    <button
                                        class={`icon hover-bg`}
                                        tooltipText={`Color Picker`}
                                        iconName={`color-picker-symbolic`}
                                        onClicked={async () => {
                                            app.get_window(`System Menu`)?.hide()
                                            execAsync([`${GLib.getenv(`HOME`)}/.scripts/color-picker`])
                                        }}
                                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                                    />
                                </box>
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
                                <MicrophoneIcon />
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
                                {
                                    brightness.screen !== 0 && (
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
                                    )
                                }
                                <AudioDeviceSlider
                                    type="audio"
                                />
                                <AudioDeviceSlider
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
                </box>
            </revealer>
        </window>
    )
}

function AudioDeviceSlider({ type }: { type: `audio` | `mic` }) {

    const wp = Wp.get_default()

    const [speakers, setSpeakers] = createState<Array<Wp.Endpoint>>([])
    const [currentSpeaker, setCurrentSpeaker] = createState<Wp.Endpoint>(type === `audio` ? wp.defaultSpeaker : wp.defaultMicrophone)
    wp.connect(`ready`, () => {
        if(type === `audio`) {
            setSpeakers(wp.audio.speakers)
            setCurrentSpeaker(wp.audio.speakers.find(speaker => speaker.isDefault) ?? wp.defaultSpeaker)
        } else {
            setSpeakers(wp.audio.microphones)
            setCurrentSpeaker(wp.audio.microphones.find(microphone => microphone.isDefault) ?? wp.defaultMicrophone)
        }
    })

    wp.connect(`notify`, () => {
        setCurrentSpeaker(type === `audio` ? wp.defaultSpeaker : wp.defaultMicrophone)
    })

    const speakerName = currentSpeaker(currentSpeaker => currentSpeaker?.name ?? `Unnamed Device`)
    const volume = currentSpeaker(currentSpeaker => currentSpeaker?.volume ?? 0)
    const volumeIcon = currentSpeaker(currentSpeaker => currentSpeaker?.volumeIcon ?? ``)
    const muted = currentSpeaker(currentSpeaker => currentSpeaker?.mute ?? true)
    const audioLabel = muted(muted => muted ? `Unmute` : `Mute`)
    const audioClass = muted(muted => muted ? `disabled` : ``)
    
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
                        <label
                            label={speakerName}
                            ellipsize={Pango.EllipsizeMode.END}
                        />
                        <image iconName={`go-down`} />
                    </box>
                    <popover>
                        <box
                            orientation={Gtk.Orientation.VERTICAL}
                            spacing={5}
                        >
                            <For each={speakers}>
                                {(speaker) => (
                                    <button
                                        class={`menu-item ${speaker.isDefault ? `selected` : undefined}`}
                                        cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                                        onClicked={() => speaker.set_is_default(true)}
                                        label={speaker.name ?? `Unnamed Device`}
                                    />
                                )}
                            </For>
                        </box>
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
                        currentSpeaker.get().set_mute(!muted.get())
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
                        currentSpeaker.get().set_volume(value)
                    }}
                    visible={true}
                    hexpand
                    valuePos={Gtk.PositionType.RIGHT}
                    cursor={Gdk.Cursor.new_from_name(`ew-resize`, null)}
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