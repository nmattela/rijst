import { fetch } from "ags/fetch";
import { monitorFile, writeFileAsync } from "ags/file";
import GObject, { property, register } from "ags/gobject";
import { execAsync } from "ags/process";

export type WeatherInfo = {
    coord: {
        lon: number,
        lat: number,
    },
    weather: Array<{
        id: number,
        main: string,
        description: string,
        icon: string,
    }>,
    base: string,
    main: {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number,
        sea_level: number,
        grnd_level: number,
    },
    visibility: number,
    wind: {
        speed: number,
        deg: number,
    },
    clouds: {
        all: number,
    },
    dt: number,
    sys: {
        type: number,
        id: number,
        country: string,
        sunrise: number,
        sunset: number,
    },
    timezone: number,
    id: number,
    name: string,
    cod: number,
}

const Weather = GObject.registerClass({
    GTypeName: `Weather`,
    Properties: {
        info: GObject.ParamSpec.object(
            `info`,
            `Info`,
            `All weather information`,
            GObject.ParamFlags.READABLE,
            GObject.Object,
        ),
        icon: GObject.ParamSpec.string(
            `icon`,
            `Icon`,
            `The appropriate weather icon`,
            GObject.ParamFlags.READABLE,
            `01d`
        ),
        image: GObject.ParamSpec.string(
            `image`,
            `Image`,
            `A fitting background image`,
            GObject.ParamFlags.READABLE,
            `/weather_image`
        )
    },
    Signals: {
        info: {},
        icon: {},
        image: {},
    }
}, class Weather extends GObject.Object {

    async fetch(key: string, location: string, unit: `metric` | `imperial` = `metric`) {
        console.log(`interval`)
        // console.log(`https://api.openweathermap.org/data/2.5/weather?APPID=${key}&q=Antwerp&units=${unit}`)
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?APPID=7e6ed49a1a7b802ad1299faa3a5f008d&q=Antwerp&units=metric`)
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?APPID=${key}&q=${location}&units=${unit}`)
        const info: WeatherInfo = await response.json()
        
        this.#info = info
        this.notify(`info`)

        if(info?.weather?.at(0)?.icon !== undefined) {
            const iconUrl = `https://openweathermap.org/img/wn/${info.weather.at(0)?.icon}@2x.png`
    
            await execAsync([`curl`, `-s`, iconUrl, `--output`, `/tmp/weather_icon`])
    
            this.notify(`icon`)
        }

        const weawowUrl = `https://weawow.com/w4/en/weather?type=full_ajax&lat=${info.coord.lat}&lng=${info.coord.lon}&weaUrl=&provider=f&topProvider=k:l`

        const weawowResponse = await fetch(weawowUrl, {
            headers: {
                Referer: `https://weawow.com/`,
                Cookie: `XSRF-TOKEN=v6lhLo3P7YFeNigdD8FotGrHqV12vntQSlwlHk1A; weawow_session=2U4KtWHtu0Ro2E633gwt3ASlWhqwbFD51W1AOgUU; 2U4KtWHtu0Ro2E633gwt3ASlWhqwbFD51W1AOgUU=eyJpdiI6InNXYjAzUTZ4VVplVThyd3U0ZnZTM0E9PSIsInZhbHVlIjoiU1cxeWFNNFhVZTVNMXErdWhTQnphK0JWTHZwbzg4WitcL0NtT09FUll3aVJ1RVZ3THZoU1ptR2dWMXlOQkJpNTRZU0FmbTN6ZWVEZG9uVXJRenhEQ2JQdnJpTWVpcjhhU1FQSzZrXC9WNmgweGNkc2FJbDRBak1SbjYrQ1dRc2pzNVU5TlBOTEJoNGlIcWpCaFVMN2VYOVY5blJjQ3E5M2cwSEpQM1pTY04rdzhaTjVrSjBJaFA0dlplZUU3TncrMm5YWlFDV0d4UDRsVEZ1cjZtczZhdklWR0ljWUhOZFVBaTNHXC9KRzRxT3ZGTmxuaStUSTF6N1l3YzJoK2xGN3dqMjRKN0M2SVlqU25VcE8xUlwvUkVEeVgxRVBvZmlJWGN4NFhOQlBjVUUwQ1dhek9UZHRTc1d6WjZjVTk3ZnJhcEg4UkRjek9HNFBUcUhyRDZNbXI5WjE2SHluTTdJVk5SU2xTV1lvbmprKys2dElVekE0VDNmdStpa2E2eFJha2JRZmJOMkVuNFJsSEd3XC9UbXd2Z1pHakNZbkpycVZwSUQ3K2k2REMrT01qbW4rUk81NURHZjArclh2b25Ua0xyamZQWTk4eU9uamJcL3Z2MSt3YlJKK05UK1wvWjJ1bFpnNmhDMUNTSEVOTUNYVU5VPSIsIm1hYyI6IjUwMGM5ZWRjNjg1MDBhNzY4ODM3MTBhZmI4ZDNjN2U2YjRlMzFiNTYxNTc4MThhOTliOTFiYmJhYjg5ZGM5OGMifQ%253D%253D; xRef=no; xOsc=1; xProvider=f; xTp=k%253Al`
            },
        })
        const weawowBody = await weawowResponse.json()

        const imageUrl = weawowBody.c.z.d
        console.log(imageUrl)

        await execAsync([`wget`, `--quiet`, `--output-document`, `/tmp/weather_image`, imageUrl])
        this.notify(`image`)
    }

    #info: WeatherInfo | undefined

    get info() {
        return this.#info
    }

    get icon() {
        return `/tmp/weather_icon`
    }

    get image() {
        return `file:///tmp/weather_image`
    }

    constructor(key: string, location: string, unit: `metric` | `imperial` = `metric`) {
        super();
        console.log(`yop`)

        this.fetch(key, location, unit)
        setInterval(async () => {
            await this.fetch(key, location, unit)
        }, 1000 * 60)

    }
})

export default Weather