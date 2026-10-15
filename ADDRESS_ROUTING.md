# Address directions experiment

The subway planner is developed on `experiment/full-subway-map` and promoted to `main` for production.

## Configuration

Set `ORS_API_KEY` in `.env.local` for development and in the hosting environment for deployment. Never use a `VITE_` prefix for this secret. `.env.local` is ignored by Git. Vite loads only the server-side `ORS_` environment variables; restart the preview after changing the key.

Address autocomplete uses NYC Planning GeoSearch without a key. Searches wait 400 ms after typing; cancelled/out-of-order responses are ignored. Only results with an NYC borough are offered. Walking requests are made from the server to `https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson`.

## Free usage

The free Standard account was checked on October 15, 2026: Directions V2 allows 2,000 requests/day and 40/minute, shared by the account. See https://account.heigit.org/info/plans.

A submitted address-to-address search compares up to three station stops at each end: at most six new Directions requests. Mixed address/station searches use at most three; station-to-station searches use none. Changing the map view, selecting an existing alternative, or refreshing train ETAs does not call the walking provider. The Find route button explicitly starts walking requests.

Successful walking connections are cached for 24 hours in bounded server memory, with concurrent identical requests coalesced. The browser also keeps a bounded session-memory cache. Caches are not durable across server restarts or multiple Vercel instances. Per-instance safeguards stop at 30 requests/minute and 1,800 requests/rolling day; these are not a distributed quota counter. Provider quotas remain the global account limit. A 403/429 triggers cooldown; there is no paid fallback or automatic retry. Expect roughly 250–300 uncached address-to-address searches daily as a conservative planning budget; repeated searches may use fewer requests.

## Scope

- NYC addresses and subway stations can be mixed in either field.
- At most three nearby station stops within 2 km are considered per address. This is not an exhaustive fastest-route search.
- Provider street walks longer than 30 minutes or 3 km are rejected.
- Walks end near GTFS station coordinates, not verified entrances or accessible entrances. Allow additional time for entering stations.
- The existing subway graph is a static schedule snapshot. Live waits and sequential transfer timing are now included in route ranking. Date/time service calendars, disruptions, and accessibility are not incorporated.
- First-train predictions must match the boarding platform, route, direction, and downstream alighting stop. Every leg is live-matched after its estimated platform-ready time.
- Walking errors never silently become straight-line walking routes. Station-only planning remains available during provider outages or quota limits.
- NYC Planning, openrouteservice, and OpenStreetMap attribution appears in the interface.

## Validation

`npm run build` and `node --import tsx --test tests/*.test.ts`.

Automated checks cover geocoder filtering, coordinate bounds, candidate limits, walking response validation, excessive detours, complete journey durations, missing-key errors, caching/coalescing, and provider rate-limit cooldowns. Live validation uses public addresses; API keys must never be printed or included in screenshots.

## Suggested exits

Exit-enabled locations from MTA Open Data dataset i9wp-a4ja were retrieved on 2026-10-15 and bundled in server/subwayExits.json. Only an exact GTFS station ID match is considered; other stations in a complex are not substituted. The closest listed exit by straight-line distance to the destination is selected before the existing street-walking request. This does not increase the six-call maximum. ORS receives the exit coordinate with a 30 m snapping radius. The label uses its compass position relative to the station, not an invented street name. Missing data falls back to a station-area walk without an exit recommendation. Exit closure status, platform access, interior travel time, and accessibility are not verified. This snapshot is not automatically refreshed.

## Departure timing

Leave now / In 15 min / In 30 min selects an anchored New York departure time (future presets expire back to now when reached). All train legs are chained: street walk, 120-second station entry allowance, live train wait, predicted downstream arrival (scheduled ride duration fallback if missing), transfer allowance, then the next live train after reaching its platform. A missing connection rejects the itinerary instead of showing a wait-free total. Total duration is measured from the selected departure, excluding time spent before leaving. Rounded summary categories sum exactly to the displayed total. These controls use the live feed horizon only, not future timetable coverage; no full calendar-aware planning is claimed. Requests recheck every 30 seconds without new walking API calls.
