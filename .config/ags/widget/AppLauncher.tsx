import { createComputed, createState, With } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Apps from "gi://AstalApps"
import { pad } from "../utils/utils";
import Pango from "gi://Pango?version=1.0";
import GObject from "gi://GObject?version=2.0";

const appsClient = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
})


export default function AppLauncher(gdkmonitor: Gdk.Monitor) {

    const [search, setSearch] = createState(``)
    const [apps, setApps] = createState<Array<Apps.Application>>(appsClient.list)
    search.subscribe(() => setApps(appsClient.exact_query(search.peek())))
    const [page, setPage] = createState(0)
    const totalPages = apps.as(apps => Math.ceil(apps.length / 12))
    const [inputFocused, setInputFocused] = createState(true)
    const [focusedItem, setFocusedItem] = createState<number>(0)
    
    focusedItem.subscribe(() => setPage(Math.floor((focusedItem.peek() ?? 0) / 12)))
    search.subscribe(() => setFocusedItem(0))

    const appsPage = createComputed([apps, page, focusedItem])
    const pageTotalPages = createComputed([page, totalPages])

    const onNavigate = (direction: Gtk.DirectionType) => {
        const [newFocusedItem, newInputFocused] = ((i: number) => {
            const [newI, newInputFocused] = (() => {
                if(direction === Gtk.DirectionType.DOWN) {
                    if((i%12) >= 8) {
                        return [i, false]
                    } else {
                        return [i + 4, false]
                    }
                }
                if(direction === Gtk.DirectionType.LEFT) {
                    return [i - 1, false]
                }
                if(direction === Gtk.DirectionType.UP) {
                    if((i%12) < 4) {
                        return [i, true]
                    } else {
                        return [i-4, false]
                    }
                }
                if(direction === Gtk.DirectionType.RIGHT) {
                    return [i+1, false]
                }
                
                return [i, false]
            })()
    
            if(newI < 0) {
                return [apps.peek().length + newI, newInputFocused]
            } else {
                return [newI % apps.peek().length, newInputFocused]
            }
        })(focusedItem.peek())

        setFocusedItem(newFocusedItem)
        setInputFocused(newInputFocused)
    }

    const close = () => {
        setSearch(``)
        setFocusedItem(0)
        setPage(0)
        app.get_window(`App Launcher`)?.hide()
    }

    const launch = (item: number) => {
        apps.peek().at(item)?.launch()
        setSearch(``)
        setFocusedItem(0)
        setPage(0)
        app.toggle_window(`App Launcher`)
    }

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
                        close()
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
                            label={`Search Apps`}
                        />
                    </box>
                    <With value={inputFocused}>
                        {inputFocused => (
                            <entry
                                text={search}
                                onNotifyText={({ text }) => setSearch(text)}
                                vexpand
                                hexpand
                                canFocus={inputFocused}
                                focusOnClick
                                onActivate={() => launch(focusedItem.peek())}
                            >
                                {/* <Gtk.EventControllerKey
                                    onKeyPressed={({ widget }, keyval) => {
                                        if(keyval === Gdk.KEY_Down) {
                                            onNavigate(Gtk.DirectionType.DOWN)
                                        }
                                    }}
                                /> */}
                            </entry>
                        )}
                    </With>
                </box>
                <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={10}
                >
                    <box>
                        <With value={page}>
                            {page => (
                                <button
                                    valign={Gtk.Align.CENTER}
                                    class={`nav-page ${page <= 0 ? `nav-page-disabled` : ``}`}
                                    iconName={`left-symbolic`}
                                    cursor={page <= 0 ? undefined : Gdk.Cursor.new_from_name(`pointer`, null)}
                                    onClicked={page <= 0 ? undefined : () => setPage(page => page-1)}
                                />
                            )}
                        </With>
                    </box>
                    <box>
                        <With value={appsPage}>
                            {([apps, page, focusedItem]) => (
                                <Gtk.FlowBox
                                    maxChildrenPerLine={4}
                                    rowSpacing={10}
                                    columnSpacing={10}
                                    focusable
                                    canFocus={inputFocused.as(i => !i)}
                                    halign={Gtk.Align.CENTER}
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
                                                launch(focusedItem)
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
                                            onClicked={() => launch((page * 12) + i)}
                                            tooltipText={app?.name}
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
                                                            maxWidthChars={10}
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
                    <box>
                        <With value={pageTotalPages}>
                            {([page, totalPages]) => (
                                <button
                                    valign={Gtk.Align.CENTER}
                                    class={`nav-page ${page >= (totalPages-1) ? `nav-page-disabled` : ``}`}
                                    iconName={`right-symbolic`}
                                    cursor={page >= (totalPages-1) ? undefined : Gdk.Cursor.new_from_name(`pointer`, null)}
                                    onClicked={page >= (totalPages-1) ? undefined : () => setPage(page => page+1)}
                                />
                            )}
                        </With>
                    </box>
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