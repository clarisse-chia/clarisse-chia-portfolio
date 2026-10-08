# Clarisse Chia — Portfolio

Clarisse Chia’s personal portfolio, beginning with one New York collection containing three interactive views.

Tagline: “building one project at a time; sometimes useful, always whimsy.”

The site identity is personal; the NYC collection is its first project. Future games can be played on this page by adding a self-contained React component to the project registry in `src/App.tsx`. The navigation expands automatically; each project owns its interactions and data. No unfinished game is advertised as playable.

 A single IBM Plex Mono type family, direct GitHub/LinkedIn header icons, and original, editable pixel-inspired graphics; no generated image is used as an authoritative map.

## What works

- **New York, Illustrated:** an animated pixel waterfront driven by current NYC weather and a seven-day hourly forecast. Select a day card with its daily weather icon and high/low temperatures, then scrub available hours to see the forecast scene. Daylight follows provider day/night values and sunrise/sunset; seasons follow the selected date. The stylized East River panorama includes One World Trade Center, Empire State Building, Chrysler Building, UN Secretariat, and Brooklyn Bridge. Walkers carry umbrellas in rain/storm scenes; a leashed corgi wears a yellow raincoat. Pause preserves their positions.
- **The Underground:** ten clickable neighborhoods covering all 22 non-shuttle subway route letters/numbers, colored pixel route traces, route highlighting, keyboard selection, separate direction groups, and live MTA arrival predictions. Stop IDs were checked against official static GTFS data. Nearby stations are grouped within an approximate 10-minute walk of a named anchor. Port Authority and Bryant Park are now included in the Times Square neighborhood. Shuttles, Staten Island Railway, buses, and commuter rail remain excluded.
- **Above the City:** real reported aircraft positions from the free ADSB.lol API, once-per-minute updates, airport-area filters, aircraft details, pause/resume, and trails/altitude history accumulated during the visit. No API key, billing account, or paid aviation service is required.

## Run locally

Requires Node.js 22.12+ and pnpm 11.25.0 (declared in `package.json`). If pnpm is unavailable, install it through your preferred Node package-manager setup; standard `npm install` / `npm run dev` also works, but avoid committing two lockfiles.

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. The landing page is New York, Illustrated. Project links use `#window`, `#subway`, and `#airspace`, in that navigation order.

The Vite development and preview servers run the same API handlers used by Vercel. No API key is required for the public MTA feeds, the noncommercial Open-Meteo endpoint, or the free ADSB.lol aircraft feed used here.

```sh
pnpm test
pnpm build
pnpm preview
```

The build outputs `dist/`. Live arrivals, weather, and aircraft require the included API functions; use Vite locally or deploy to Vercel. Do not open `index.html` by double-clicking it.

## Deploy to Vercel

1. Put this project folder in a Git repository and push it to your account.
2. Import that repository in Vercel. If the repository contains other work, set the **Root Directory** to this folder.
3. Select the **Vite** framework, Node.js **22.x** or newer supported runtime, install command `pnpm install --frozen-lockfile`, build command `pnpm build`, and output directory `dist`.
4. Vercel serves the frontend and the three `api/*.ts` Node functions. No secrets or environment variables are required for this version. If your Vercel project does not honor the pinned package manager, enable its Corepack integration or select the declared pnpm version.
5. After deployment, verify `/api/arrivals?hub=times-square`, `/api/weather`, and `/api/aircraft`, then use the site on desktop and mobile. The host can affect upstream data access, so local success is not a substitute for deployed verification.

`vercel.json` includes build settings, API durations, and basic response headers. This project has not been published or connected to a personal Vercel account.

## Data and behavior

- MTA feed cache: 25 seconds per feed, shared within a warm server instance. Browsers refresh active arrivals every 30 seconds. Responses can be briefly edge-cached; the displayed timestamp is the source feed timestamp.
- Feed timestamps older than 180 seconds are excluded. Missing feeds produce a visible partial-data state. All feeds unavailable produces an unavailable state with a retry button. Only real predictions are displayed.
- Canceled trips, deleted entities, skipped/no-data stops, expired predictions, unknown routes, and nonmatching platforms are excluded. 6X/7X/FX route IDs normalize to their parent route with express labels.
- Destination names come from the last provided stop in the trip update and the checked-in static stop dictionary. MTA predictions and service patterns can change; use official travel information for actual journeys. In unusual truncated updates, the last reported stop may differ from a trip's intended final terminal.
- The J/Z geographic panel grouping is reversed relative to the GTFS N/S suffix wherever shown. Every train row states its destination and exact boarding station.
- MTA service alerts are not integrated yet. Their addition and deployment verification are recommended before promoting the app as a travel tool.
- Open-Meteo conditions are model-based current conditions, not a camera or weather-station reading. Weather is cached for ten minutes and checked for freshness. Failed weather updates display an unavailable message and a neutral illustration. Forecast controls disable when fresh forecast data is unavailable.
- All scripts and fonts are bundled locally. No analytics, accounts, cookies, database, or paid services are included.
- `prefers-reduced-motion` disables CSS movement and initializes city-window animation paused. Users can explicitly resume it.

## Customize

- `src/App.tsx`: personal identity, introduction, navigation, about text, and project registry. Add a game or other project with its own component, stable ID, title, description, and icon.
- `src/components/Subway.tsx` and `MapBase.tsx`: map and panel layout.
- `src/data/transit.ts`: neighborhood labels, route colors, and platform IDs.
- `src/data/routePaths.ts`: the 22 editable schematic route traces, branch shapes, and terminal summaries.
- `src/components/Airspace.tsx`: live aircraft interface, observed trails, and provider-aware polling.
- `server/aircraft.ts` and `api/aircraft.ts`: free-provider normalization, caching, and rate-limit handling.
- `src/data/airspace.ts` and `RadarGeography.tsx`: geographic projection, airport filters, and map drawing.
- `src/components/CityWindow.tsx`: unified current weather and forecast controls.
- `src/art/nycScene.ts` and `src/components/PixelScene.tsx`: editable skyline, seasonal palettes, pedestrians, corgi, and animation.
- `src/styles.css`: visual system and responsive rules.
- `server/stops.json`: official subway stop-name lookup. Refresh it from the MTA static GTFS `stops.txt` when the network changes.

## Sources

- [MTA developer resources](https://www.mta.info/developers)
- [MTA regular subway GTFS](https://rrgtfsfeeds.s3.amazonaws.com/gtfs_subway.zip)
- [MTA subway maps](https://www.mta.info/maps)
- [Open-Meteo weather API](https://open-meteo.com/en/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

The MTA data and its brand artwork have different usage terms. This app uses an original schematic and square text route badges, with no MTA logo. Review provider terms for the final public/commercial use. Open-Meteo's free endpoint is for noncommercial use; revisit its plan if the project becomes commercial.

## Next improvements

Add service alerts, deployed monitoring, and review aircraft coverage after deployment.

Optional fourth study: **Harbor Lights**, an interactive waterfront/ferry view. Finish the initial three before expanding.

## Neighborhood model (October 8 update)

Each neighborhood is a curated, walkable area anchored at its first named station, not a ridership ranking or a claim of a single connected station. Walking minutes are approximate editorial estimates from the anchor, not directions, accessibility guarantees, or the visitor's location. They do not affect the displayed train ETA.

The ten neighborhoods are Times Square / Bryant Park, Union Square, Concourse / Yankee Stadium, Jackson Heights, East New York / Broadway Junction, Downtown Brooklyn, Williamsburg / Lorimer, Long Island City / Court Square, Lower Manhattan / Fulton, and Harlem / West 125th Street.

Each member station owns its platform IDs. The server attaches `stationId` and `stationName` to every prediction. Two calls of the same train at different neighborhood stations remain separate because they have different boarding locations. “Board at” filters by station; route and station filters reset appropriately when incompatible. Expand “Stations & estimated walks” to see membership and anchor-relative walking estimates.

See NEIGHBORHOODS.md for the full list and scope decisions. The portfolio still covers all 22 non-shuttle route letters/numbers.

## Local network certificate setup

On this Mac, Node needed the operating system's trusted certificates to reach the MTA feed through the local network. With Node 24, launch using `NODE_USE_SYSTEM_CA=1 pnpm dev` if the API reports unavailable due to a local issuer certificate error. The current preview uses system certificate trust. This is a local runtime setting; the application still validates HTTPS certificates normally.

## Interactive route traces

Choose a route in “Find your line” above the map, or in the arrivals panel. Its colored, stepped line appears across the map, matching neighborhoods stay highlighted, and arrivals filter to that route. Choose the same route again, select “All,” or use “Clear” to remove the trace. Selecting a neighborhood that does not serve the highlighted route clears the route selection.

The paths are original, art-directed schematics. They connect neighborhood-level markers and omit intermediate stops; they are not surveyed track alignments or station-by-station navigation. Regular-service corridors were reviewed against the [MTA line maps](https://www.mta.info/maps/subway-line-maps) on October 8, 2026, including the current F/M Queens crossings. A and 5 branches are shown in simplified form. Terminal summaries describe the overview, not every time-dependent short turn or extension. Live arrival updates do not redraw these paths for temporary reroutes.

Validation covers all 22 route selections, correct supported neighborhood membership, label clearance, keyboard operation, clear/toggle behavior, responsive widths, and reduced-motion behavior. See `VALIDATION.json` for the latest browser check.

## Free live aircraft feed

Above the City defaults to live positions from [ADSB.lol](https://www.adsb.lol/docs/open-data/api/), using its public `/v2/point/40.72/-74.0/35` endpoint. The identifying User-Agent is `NYCObservatory/0.1 (personal portfolio prototype)`. No account, subscription, card, API key, or paid endpoint is used.

The browser checks once per 60 seconds while visible and unpaused. The server coalesces concurrent requests and caches each successful result for 60 seconds per warm instance; Vercel can additionally cache responses at the edge for 15 seconds. Provider rate limits are dynamic. HTTP 429/503 responses honor Retry-After (seconds or HTTP date), defaulting to a five-minute pause when absent. Other failures back off from one minute, increasing to twenty minutes. Pause/resume cannot bypass the client cooldown, and airport/aircraft selection makes no extra feed requests. Caching reduces requests; it is not a global cross-region rate limiter, so review traffic before scaling beyond a small portfolio.

Feed snapshots over 90 seconds old or implausibly in the future are rejected. Individual positions over 120 seconds old, invalid coordinates, ground traffic, and missing position ages are excluded. Stale aircraft disappear instead of flying along an invented path. Paused snapshots remain explicitly labeled and show increasing ages. Unknown measurements display “Not reported.” Outages show an unavailable state and retry at the provider’s allowed cadence.

Airport buttons mean “within 10 nautical miles of this airport,” including passing traffic. They are not confirmed arrivals/departures. The feed does not supply verified origin/destination information. Ground track, altitude (barometric feet), ground speed (knots), and vertical rate come from the source; absent readings stay null. Trails and altitude charts contain only observations received during this visit, with gaps broken after 150 seconds.

Aircraft and airport coordinates share a local geographic projection. NYC borough outlines are simplified from [NYC DCP Borough Boundaries, version 26b](https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne), downloaded October 8, 2026. Nearby New Jersey shoreline is an approximate contextual drawing. Range rings are approximate nautical-mile distances from the map center. Tiny islands and detail are omitted.

ADSB.lol data is [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) and is attributed in the interface. Its [API documentation](https://api.adsb.lol/docs) asks production users to contact the operator before relying on the service; do that before the public Vercel launch. The [provider repository](https://github.com/adsblol/api) documents dynamic rate limits and possible future access changes. The app is currently a local portfolio preview.

## Aircraft movement colors

The live radar colors aircraft by reported barometric vertical rate: mint means descending at 300 ft/min or more; amber means climbing at 300 ft/min or more; gray means a smaller altitude change or an unknown rate. The 300 ft/min threshold is an interface choice to reduce visual noise, not an arrival/departure classifier. Descent or climb does not establish a flight's destination, origin, or operational phase.

The legend doubles as a movement filter and combines with the selected airport area. Counts reflect the airport area before the movement filter. Selection retains the movement color and adds a pale outline. Arrow symbols, hover descriptions, and a text label in the details panel supplement color. Trails and the observed-altitude chart match the selected aircraft's movement color. No API calls are added by this feature; the existing 60-second cadence and provider backoff remain unchanged.

## New York, Illustrated: forecast cards and hours

“New York, Illustrated” replaces the previous title “A New York Minute.” The manual “Set the scene” controls have been replaced with a unified current-weather and forecast view. It opens at the current New York day/time; day cards and the time slider are always visible, and “Back to now” resets a forecast selection. Users no longer choose an arbitrary season, sky, or hour unrelated to weather data.

The free Open-Meteo request fetches seven calendar days (today plus six following days) of hourly temperature, WMO weather code, day/night state, and precipitation probability, plus daily sunrise/sunset, high/low temperatures, and weather summary. [Forecast API documentation](https://open-meteo.com/en/docs). Daily cards show the daily summary; the scene and sidebar show the selected hour, so their weather descriptions can differ. Temperatures are Fahrenheit.

Only future available hourly timestamps can be selected. Today remains available for the current conditions even when no future hourly slots remain; its slider starts with “Now.” Missing hours and unknown weather codes are excluded; absent precipitation probabilities stay unavailable. Current weather still works if hourly data is missing. All day boundaries and labels use America/New_York. Timestamps distinguish repeated daylight-saving hours, and hour labels include EST/EDT. Selecting days and hours uses the already-loaded forecast and makes no additional API calls.

The server coalesces requests and caches the complete response for ten minutes. Visible clients refresh every ten minutes. Stale or failed responses are labeled unavailable; no forecast values are invented. The displayed retrieval time is when the app fetched the data, not a claimed forecast model issue time.

The animation distinguishes clear, cloudy, fog, rain, snow, and storm conditions; storm scenes use rain without flashing lightning. Day/night comes from the provider, and warm dawn/dusk palettes follow the daily sunrise/sunset. Seasonal foliage follows the selected date. These are illustrative depictions of forecast conditions, not a prediction of an exact view.

Day cards use weekday, date, weather icon/description, and high/low temperatures, with a visible selected state and horizontal scrolling on small screens. Hour controls include a slider and Earlier/Later buttons. Changing selections and returning to now do not make extra API requests. Neighborhood selection uses a small marker halo, a highlighted connector, and a slim name accent; keyboard focus uses local corner marks around the map marker.

## Live-only portfolio — October 8 update

The approved palette is moss and cream. Clarisse’s name appears once, above the exact tagline. The header contains only the social icons and About; the collection uses concise Weather, Subway, and Flights tabs. Repeated branding, footer slogans, and instructional copy have been removed.

Subway and aircraft views use live feeds exclusively. Demo switches, synthetic data generators, and the simulated aircraft component have been removed. Legacy mode query parameters do not change the live view. Subway outages provide Try again; aircraft outages retain automatic backoff and Retry-After handling. No paid API or faster polling was introduced.
