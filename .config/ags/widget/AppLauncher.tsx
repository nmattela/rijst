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

    const appsPage = createComputed([apps, page])

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
            <Gtk.EventControllerKey
                onKeyPressed={({ widget }, keyval) => {
                    if (keyval === Gdk.KEY_Escape) {
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
                    spacing={10}
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
                    />
                </box>
                <With value={appsPage}>
                    {([apps, page]) => (
                        <Gtk.FlowBox
                            maxChildrenPerLine={4}
                            rowSpacing={10}
                            columnSpacing={10}
                        >
                            {pad(apps.slice(page, (page+1)*12), 12).map((app, i) => (
                                <button
                                    class={app !== undefined ? "app" : undefined}
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
        </window>
    )
}