import { createBinding, createState, With } from "ags";
import Weather from "../utils/Weather";
import { Gdk, Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

export default function WeatherView() {
    const weather = new Weather(`7e6ed49a1a7b802ad1299faa3a5f008d`, `Antwerp`)

    const info = createBinding(weather, `info`)
    const image = createBinding(weather, `image`)
    const copyright = createBinding(weather, `copyright`)
    const source = createBinding(weather, `source`)

    return (
        <With value={image}>
            {image => (
                <centerbox
                    hexpand
                    // widthRequest={500}
                    heightRequest={300}
                    // widthRequest={300}
                    class="Weather"
                    css={`background-image: linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)), url(${image});`}
                    orientation={Gtk.Orientation.VERTICAL}
                >
                    <centerbox
                        $type="start"
                        orientation={Gtk.Orientation.HORIZONTAL}
                    >
                        <box
                            $type="start"
                            orientation={Gtk.Orientation.HORIZONTAL}
                            spacing={5}
                        >
                            <image
                                file={createBinding(weather, `icon`)}
                                widthRequest={40}
                                heightRequest={40}
                            />
                            <label
                                label={info.as(info => info?.weather?.at(0)?.description ?? ``)}
                            />
                        </box>
                        <button
                            $type="end"
                            class="copyright"
                            label={copyright}
                            onClicked={() => execAsync([`xdg-open`, source.get()])}
                            cursor={Gdk.Cursor.new_from_name(`pointer`, null)}
                        />
                    </centerbox>
                    <box
                        $type="center"
                        halign={Gtk.Align.CENTER}
                    >
                        <label
                            class="temperature"
                            label={info.as(info => `${info?.main?.temp}°C`)} />
                    </box>
                    <centerbox
                        $type="end"
                        orientation={Gtk.Orientation.HORIZONTAL}
                    >
                        <label
                            $type="start"
                            label={info.as(info => `Feels like ${info?.main.feels_like}°C`)} />
                        <label
                            $type="end"
                            label={info.as(info => `${info?.main.humidity}% humidity`)} />
                    </centerbox>
                </centerbox>
            )}
        </With>
    )
}