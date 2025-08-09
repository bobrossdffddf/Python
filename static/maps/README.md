
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

### Step 1: Add Your Game Map (SVG Format)
1. Export your PTFS game map as SVG format
2. Save it as `game_map.svg` in this directory
3. Ensure the SVG uses the coordinate system where:
   - 0,0 in-game maps to 0,0 in the SVG
   - 1 SVG pixel = 100 game studs
   - Content may extend outside the viewport (this is expected)

### Step 2: Coordinate System (Simplified)
The coordinate system is now simplified:
- **No manual coordinate configuration needed**
- Airport coordinates are automatically calculated from PTFS coordinates
- Formula: SVG_coordinate = PTFS_coordinate / 100
- All airports are already configured in `map_config.js`

### Step 3: SVG Requirements
Your SVG map should follow these specifications:
- 0,0 in-game = 0,0 in SVG coordinate space
- Scale: 1px = 100 studs
- The map content may extend beyond the viewBox
- This simplifies layer additions as no offset/scaling is needed

### Example Workflow:
1. Export/create `game_map.svg` with the correct coordinate system
2. Upload to this directory
3. The system will automatically position airports correctly
4. Live aircraft tracking will work immediately with accurate positioning

### Technical Notes:
- Airport coordinates are pre-calculated from known PTFS coordinates
- Live aircraft positions are converted using: SVG_pos = PTFS_pos / 100
- Y-axis is flipped for proper SVG display
- All overlays and markers will align automatically
