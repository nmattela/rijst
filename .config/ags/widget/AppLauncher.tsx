import { createComputed, createState, With } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Apps from "gi://AstalApps"
import { pad } from "../utils/utils";
import Pango from "gi://Pango?version=1.0";

const appsClient = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
})


export default function AppLauncher(gdkmonitor: Gdk.Monitor) {

    const [search, setSearch] = createState(``)
    const apps = search.as(search => appsClient.fuzzy_query(search))
    const [page, setPage] = createState(0)
    const totalPages = apps.as(apps => Math.ceil(apps.length / 12))
    const [inputFocused, setInputFocused] = createState(true)
    const [focusedItem, setFocusedItem] = createState<number>(0)
    const [searchBox, setSearchBox] = createState<Gtk.FlowBox | undefined>(undefined)
    
    focusedItem.subscribe(() => setPage(Math.floor((focusedItem.get() ?? 0) / 12)))

    const appsPage = createComputed([apps, page, focusedItem])
    const pageTotalPages = createComputed([page, totalPages])

    const onNavigate = (direction: Gtk.DirectionType) => setFocusedItem(i => {
        const newI = (() => {
            if(direction === Gtk.DirectionType.DOWN) {
                if((i%12) >= 8) {
                    return i
                } else {
                    return i + 4
                }
            }
            if(direction === Gtk.DirectionType.LEFT) {
                return i - 1
            }
            if(direction === Gtk.DirectionType.UP) {
                if((i%12) < 4) {
                    setInputFocused(true)
                    return 0
                } else {
                    return i-4
                }
            }
            if(direction === Gtk.DirectionType.RIGHT) {
                return i+1
            }
            
            return i
        })()

        if(newI < 0) {
            return apps.get().length + newI
        } else {
            return newI % apps.get().length
        }
    })

    return (
        <window
            class={`AppLauncher`}
            name={`App Launcher`}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.EXCLUSIVE}
            application={app}
            // visible={true}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
            gdkmonitor={gdkmonitor}
            widthRequest={0}
            heightRequest={0}
        >
            <Gtk.EventControllerScroll
                onScroll={(_, keyval) => console.log(keyval)}
                onScrollBegin={() => console.log(`begin`)}
                onScrollEnd={() => console.log(`end`)}
            />
            <Gtk.EventControllerKey
                onKeyPressed={({ widget }, keyval) => {
                    if(keyval === Gdk.KEY_Escape) {
                        widget.hide()
                    } else if(keyval === Gdk.KEY_Return) {
                        apps.get().at(focusedItem.get())?.launch()
                        widget.hide()
                    }
                }}
            />
            <box
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
                spacing={50}
            >
                <box
                    class="search-box"
                >
                    <box
                        class="search-icon"
                        orientation={Gtk.Orientation.HORIZONTAL}
                        spacing={10}
                    >
                        <image
                            iconName={`system-search`}
                        />
                        <label
                            label={`Search`}
                        />
                    </box>
                    <entry
                        text={search}
                        onNotifyText={({ text }) => setSearch(text)}
                        vexpand
                        hexpand
                        canFocus={inputFocused}
                    >
                        <Gtk.EventControllerKey
                            onKeyPressed={({ widget }, keyval) => {
                                if(keyval === Gdk.KEY_Down) {
                                    searchBox.get()?.grab_focus()
                                    setInputFocused(false)
                                }
                            }}
                        />
                    </entry>
                </box>
                <box>
                    <With value={appsPage}>
                        {([apps, page, focusedItem]) => (
                            <Gtk.FlowBox
                                maxChildrenPerLine={4}
                                rowSpacing={10}
                                columnSpacing={10}
                                focusable
                                $={(self) => setSearchBox(self)}
                            >
                                <Gtk.EventControllerKey
                                    onKeyPressed={(_, keyval) => {
                                        const direction = (() => {
                                            if(keyval === Gdk.KEY_Down) {
                                                return Gtk.DirectionType.DOWN
                                            } else if(keyval === Gdk.KEY_Left) {
                                                return Gtk.DirectionType.LEFT
                                            } else if(keyval === Gdk.KEY_Up) {
                                                return Gtk.DirectionType.UP
                                            } else if(keyval === Gdk.KEY_Right) {
                                                return Gtk.DirectionType.RIGHT
                                            } else {
                                                return undefined
                                            }
                                        })()

                                        if(direction !== undefined) {
                                            onNavigate(direction)
                                        } else if(keyval === Gdk.KEY_Return) {
                                            apps.at(focusedItem ?? 0)?.launch()
                                            app.toggle_window(`App Launcher`)
                                        }
                                    }}
                                />
                                {pad(apps.slice(page*12, (page+1)*12), 12).map((app, i) => (
                                    <button
                                        label={app?.name}
                                        class={app !== undefined ? `app ${focusedItem === (i + 12*page) ? `app-focus` : ``}` : undefined}
                                        halign={Gtk.Align.CENTER}
                                        valign={Gtk.Align.CENTER}
                                        widthRequest={200} 
                                        heightRequest={115}
                                        cursor={app !== undefined ? Gdk.Cursor.new_from_name(`pointer`, null) : undefined}
                                        onClicked={() => app?.launch()}
                                    >
                                        {
                                            app !== undefined && (
                                                <box
                                                    orientation={Gtk.Orientation.VERTICAL}
                                                    spacing={10}
                                                    valign={Gtk.Align.CENTER}
                                                    halign={Gtk.Align.CENTER}
                                                >
                                                    <image
                                                        iconName={app.iconName}
                                                        pixelSize={40}
                                                    />
                                                    <label
                                                        label={app.name}
                                                        maxWidthChars={15}
                                                        ellipsize={Pango.EllipsizeMode.END}
                                                    />
                                                </box>
                                            )
                                        }
                                    </button>
                                ))}
                            </Gtk.FlowBox>
                        )}
                    </With>
                </box>
                <box
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                >
                    <With value={pageTotalPages}>
                        {([page, totalPages]) => (
                            <label
                                class="page"
                                label={`${page+1}/${totalPages}`}
                            />
                        )}
                    </With>
                </box>
            </box>
        </window>
    )
}