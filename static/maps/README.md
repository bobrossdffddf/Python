
# Map Assets

This directory contains map files and assets for the ATC Flight Plan Monitor.

## Supported Formats

- **SVG Files**: Vector graphics for airport layouts, approach charts, etc.
- **PNG/JPG**: Raster images for satellite maps, terrain maps
- **GeoJSON**: Geographic data files for airspace boundaries, routes

## Usage

Place your map files here and reference them in the application:

### SVG Maps
```javascript
// Example: Loading an airport diagram
const svgMap = '/static/maps/airport_diagram_IGRV.svg';
```

### Background Maps
```javascript
// Example: Custom tile server
const customTileLayer = L.tileLayer('/static/maps/tiles/{z}/{x}/{y}.png');
```

## File Naming Convention

- Airport diagrams: `airport_diagram_[ICAO].svg`
- Approach charts: `approach_[ICAO]_[RUNWAY].svg`
- Route maps: `route_[DEPARTURE]_[ARRIVAL].svg`
- Sectional charts: `sectional_[REGION].png`
- Enroute charts: `enroute_[TYPE]_[REGION].png`
- Custom overlays: `overlay_[NAME].svg`

## Examples

You can add files like:
- `airport_diagram_IGRV.svg` - Grove Airport layout
- `approach_ILAR_09L.svg` - Larnaca Airport approach chart
- `route_IGRV_ILAR.svg` - Custom route from Grove to Larnaca
- `route_IBAR_IPAP.svg` - Custom route from IBAR to IPAP
- `sectional_florida.png` - Florida sectional chart
- `enroute_low_southeast.png` - Low altitude enroute chart
- `overlay_airspace.svg` - Airspace boundaries overlay
