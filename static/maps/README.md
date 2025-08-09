
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
- **`game_map.png`** - Your PTFS game map for live flight tracking

## Setting Up Live Flight Tracking

### Step 1: Add Your Game Map
1. Take a screenshot or export your PTFS game map
2. Save it as `game_map.png` in this directory
3. Make sure it shows all airports clearly

### Step 2: Configure Airport Coordinates
1. Open `map_config.js` in this directory
2. Update the `airportMapCoordinates` section with the pixel coordinates of each airport on your map
3. Use the coordinate helper by opening browser console and running `setupCoordinateHelper()`
4. Click on airports in your map to get their coordinates

### Step 3: Calibrate PTFS Coordinate Conversion
1. In `map_config.js`, adjust the `ptfsBounds` values to match your game world boundaries
2. Test with known aircraft positions to ensure accurate positioning

### Example Workflow:
1. Upload `game_map.png`
2. Open flight details for any flight
3. In browser console, run `setupCoordinateHelper()`
4. Click on airports to get coordinates
5. Update `map_config.js` with the coordinates
6. Refresh and test live tracking
