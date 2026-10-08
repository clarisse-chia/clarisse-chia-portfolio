# NYC Observatory — portfolio build plan

## Objective
Create a cohesive personal portfolio featuring three interactive NYC studies, opening with A New York Minute, followed by a ten-neighborhood subway explorer and the airport radar. NYC Observatory is a working title. Do not invent the owner's biography or contact details.

## Original build sequence
1. Build the portfolio shell and responsive map/arrivals layout. Use charcoal, ivory pixel display lettering, readable monospace details, dotted geography, and route-colored square badges.
2. Implement six subway hubs: Times Sq–42 St (1 2 3 7 N Q R W); Union Sq (4 5 6 L N Q R W); Yankee Stadium (4 B D); Jackson Heights (7 E F M R); Broadway Junction (A C J Z L); Hoyt–Schermerhorn (A C G). Cover 22 non-shuttle route letters/numbers. Omit S, SIR, regional rail, and buses. Times Square includes only its named platforms, not other connected station complexes.
3. Add route filtering, hub selection, directional arrivals, keyboard support, and clearly labeled sample data. Use official MTA realtime feeds through a server endpoint where available. Never silently substitute demo times for unavailable live predictions.
4. Build an airport radar prototype for JFK, LGA, and EWR. Label all simulated flights. Live aircraft data requires a later provider integration.
5. Build a living pixel NYC window with seasonal, weather, and time-of-day variations. Use actual New York time and weather when available, plus explicitly labeled manual preview controls.
6. Test coverage, feed handling, desktop/mobile layouts, and accessibility. Package source, production build, and Vercel instructions.

## Delivery
First working foundation target: 30–60 minutes of active development, excluding permission/setup waits. Further polish, personal branding, flight data integration, and launch: approximately 2–4 weeks of developer effort. These are estimates.

Use React, TypeScript, Vite, and small Vercel functions. No accounts or database. Deliver a local preview before any public deployment.

## Later project ideas
Harbor/ferry movement; user-initiated city soundscape; historical pixel streetscapes. Keep the first release focused on the original three projects.

## First-version delivery status — October 8, 2026

Completed: responsive portfolio shell; six-hub, 22-route subway explorer; live MTA predictions and explicit demo mode; simulated JFK/LGA/EWR radar; animated seasonal NYC window with local time and current weather; Vercel configuration and setup guide.

Validation: 13 unit tests; TypeScript and production build; all 22 route filters; six fresh live hub responses; offline-to-demo behavior; keyboard station selection; 360/390/768px layouts; reduced-motion support; no browser errors. See VALIDATION.json for the live check snapshot. Real feeds are time-dependent, so route availability varies.

Not completed or claimed: public deployment, owner branding/contact details, live aviation integration, MTA service-alert integration, or a geographically authoritative full subway map.

Next estimate: roughly 1–3 days for focused owner branding, visual review, and deployment hardening. Live aviation can add several days to 1–2 weeks depending on provider access, display rights, and desired detail.

## Neighborhood update — October 8, 2026

Accepted direction: show A New York Minute first and by default, The Underground second, and Above the City third. Expand the subway experience to ten curated neighborhoods, retaining all 22 non-shuttle route letters/numbers and representation in four boroughs. Include Williamsburg, Long Island City, Downtown Brooklyn, and Lower Manhattan.

Implemented: ten labeled map clusters; per-station platform membership; station names on every arrival; a boarding-station filter; expandable station lists with approximate anchor-relative walks; compatible route/station filtering; mobile layout updates. See NEIGHBORHOODS.md for membership and boundaries.

Validation: 17 unit tests and production compilation passed. All ten clusters returned live MTA predictions. The browser checks passed for 22 route filters, all ten map labels and markers, station filtering, keyboard selection, failure-to-demo behavior, and layouts at 360/390/768px, with no browser errors. Details are recorded in VALIDATION.json. Public deployment and live aviation remain future work.

## Route-trace update — October 8, 2026

Added one selected route at a time as a colored, stepped line, with route and terminal summaries, matched neighborhood markers, simplified branches, a clear-selection control, and reduced-motion support. Moved the route selector above the map so visitors can choose a line before exploring its path. The arrival panel uses the same selection. These are regular-service schematics, with temporary reroutes and intermediate stations omitted.

Validation: 19 unit tests; TypeScript/production build; all 22 browser route selections, label clearance, clear/toggle behavior, keyboard selection, 360/390/768px layouts, and reduced-motion checks.

## Free live radar update — October 8, 2026

User authorized replacing simulated-only aircraft with a free live feed and requested updates no more frequently than the provider permits. Added ADSB.lol live positions, a 60-second visible-page polling cadence, server request coalescing/cache, Retry-After handling and backoff, geographic mapping, airport-proximity filters, and observed trails/altitude history. Synthetic traffic remains an explicit Demo option. Public deployment remains separate; provider production-use contact is documented in README.

Live radar validation: 30 total unit tests passed; TypeScript and production build passed; the real feed returned 64 fresh aircraft during the final browser check. Controlled browser responses verified minute-based polling, no extra fetch on airport selection, Retry-After backoff, pause/resume, stale/empty states, actual-observation history, explicit demo switching, keyboard selection, and 360/390/768px layouts. No browser errors. See VALIDATION.json for the timestamp and details.

## Aircraft movement-color update — October 8, 2026

Added mint descent, amber climb, and neutral level/unknown colors based on reported vertical rate, with a clickable legend, counts, accessible text/arrows, and a selection outline that preserves movement color. Confirmed arrival/departure status is not available from this feed and is not claimed. Validation: two new classification tests, all three colors checked in the browser, no extra requests on filters, keyboard selection, 360/390/768px layouts, and a live snapshot containing each category.

## Forecast view and day-card update — October 8, 2026

Renamed the first project to A New York View. Replaced arbitrary scene controls with a seven-day hourly forecast from the existing free Open-Meteo integration. Added weather-card day selection inspired by the user's reference: weekday/date, daily icon, summary, high/low temperatures, selected state, and a scrolling mobile row. The hourly slider and Earlier/Later controls update forecast temperature, conditions, season, and daylight. Daily sunrise/sunset replaces the fixed day/night cutoff.

Validation: seven new weather tests, including missing data, source freshness, New York day boundaries, repeated DST hours, weather mapping, and daylight. Live endpoint returned 168 hourly readings and seven daily summaries. Browser checks verified card selection, forecast-driven rain/snow/fog/storm/night scenes, no extra requests on selection, unavailable state, keyboard use, and 360/390/768px layouts.


## Skyline and unified interactions — October 8, 2026

Added a recognizable, stylized Manhattan panorama from the East River, rain umbrellas on both walkers, and an animated leashed corgi with a yellow raincoat. Animation pause retains positions. Unified weather and forecast selection: default current time, persistent day cards/hour controls, and Back to now. Subway selection uses a marker halo and slim name accent instead of a bounding box, with a local keyboard focus indicator. All visitor-facing cluster terminology is now neighborhood.

Browser validation covers clear/rain/storm/snow/night scenes, pause/resume, current-time default/reset, no extra requests on selection, unavailable weather, 360/390/768px widths, neighborhood selection, and keyboard focus. Saved screenshots use controlled weather fixtures for visual verification.


## Personal portfolio identity — October 8, 2026

Clarisse Chia is the primary site identity. The exact tagline is “building one project at a time; sometimes useful, always whimsy.” Header, hero, about, footer, and browser metadata now frame the NYC projects as the first portfolio collection. The project registry owns each component and navigation entry, allowing future inline games without changing the site’s identity. Games remain a future possibility, with no inactive game controls.

Portfolio validation: TypeScript and production build passed. Browser checks confirmed exact tagline, metadata, all three project switches, header anchors, About on mobile, and no horizontal overflow at 360/390/768px. Desktop and mobile screenshots were visually reviewed; no browser errors.


## Portfolio cleanup — October 8, 2026

Treat New York as one collection with three views. Removed the redundant Projects header link, hero jump link, extra intro, and repeated social links. GitHub and LinkedIn now appear as accessible icon links in the header. Removed the Silkscreen font import and standardized all interface typography on IBM Plex Mono; illustrations retain their pixel character. Prepared three separate palette studies without changing the active moss palette. TypeScript/build passed; browser checks verified links, icons, one font, About, and 360/390/768px layouts with no errors. Desktop/mobile and palette previews were visually inspected.


## Approved palette, declutter, and live-only views — October 8, 2026

Retained moss and cream. Name appears once, with the original tagline; removed repeated branding, slogans, descriptive tab text, and heading labels. Tabs now read Weather, Subway, Flights. Removed subway demo mode and generator, its two obsolete tests, the aircraft demo component, both mode switches, and all demo fallback links. Subway failure offers retry; aircraft polling/backoff is unchanged. TypeScript, production build, and 37 remaining unit tests passed.

Browser checks confirmed legacy demo URLs load live feeds, unavailable/partial/stale/empty transit states, retry recovery, aircraft rate-limit handling and pause, and mobile layouts. Preview uses current weather; data-state checks use controlled fixtures. No browser errors.
