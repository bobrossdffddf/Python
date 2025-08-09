
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

### COORDINATE DEFINITION GUIDE for 964x921 Map

Your map is loaded and ready! Now you need to define where each airport is located on your map.

### Step 1: Use the Coordinate Helper
1. Open any flight in the system
2. Click the "⛶ Expand" button on the Route Map
3. Click the "📍" button in the fullscreen view to activate coordinate helper
4. Left-click anywhere on the map to see coordinates
5. Right-click on each airport location to define it

### Step 2: Define Airport Positions
For each airport (IBAR, IHEN, ILAR, etc.):
1. Find the airport on your map visually
2. Right-click on that exact location
3. Enter the airport code (e.g., "IBAR")
4. Repeat for all airports

### Step 3: Export and Update Configuration
1. After defining all airports, run: `exportAirportCoordinates()`
2. Copy the output from the console
3. Replace the airport coordinates in `map_config.js`

### Current Map Specifications:
- **Dimensions**: 964 × 921 pixels
- **ViewBox**: "0 0 964 921"
- **Coordinate System**: Direct pixel mapping (1:1)
- **Origin**: Top-left corner (0,0)

### Example Workflow:
1. ✅ Map loaded (game_map.svg - 964x921)
2. 🔄 Define airport coordinates using helper tool
3. 📋 Copy coordinates to map_config.js
4. 🎯 Live aircraft tracking will work accurately

### Airport List to Define:
IBAR, IHEN, ILAR, IIAB, IPAP, IGRV, IJAF, IZOL, ISCM, IDCS, ITKO, ILKL, IPPH, IGAR, IBLT, IRFD, IMLR, ITRC, IBTH, IUFO, ISAU, ISKP

**Status**: Ready for coordinate definition!
