TNNA Version 1.0 local U.S. boundary data

Do not manually place county files here. Version 1.0 intentionally does not announce counties.

Generate the local nationwide dataset from the official U.S. Census Bureau TIGERweb January 1, 2026 boundary service:

  npm run build:boundaries

The builder creates:

  public/data/us/manifest.json
  public/data/us/<state-fips>-<state-abbreviation>.json

Coverage:
- Incorporated places (cities, towns, villages, boroughs, etc.)
- Consolidated cities
- Census Designated Places (CDPs)
- General-purpose county subdivisions/MCDs in the 12 states where Census treats them as local governments comparable to places

The data is divided by state and loaded on demand by Android. No county fallback is used.
