

// Map Configuration for PTFS Game Map
// Updated to use actual PTFS coordinates for accurate positioning

const MAP_CONFIG = {
    // Path to your game map SVG file
    gameMapPath: '/static/maps/game_map.svg',
    
    // Actual SVG map dimensions
    mapWidth: 1200,
    mapHeight: 1200,
    
    // SVG viewBox for your map
    viewBox: "0 0 1200 1200",
    
    // Coordinate system: Uses PTFS coordinates converted to map coordinates
    coordinateScale: 1,
    
    // Airport positions - NOW USING ACTUAL PTFS COORDINATES
    // These will be automatically converted to map coordinates by the system
    airportMapCoordinates: {
        // Using the PTFS coordinates from main.py for accurate positioning
        'IBAR': { x: -1250, y: 2100 },    // PTFS coordinates
        'IHEN': { x: -890, y: 1890 },     // PTFS coordinates
        'ILAR': { x: -1540, y: 2250 },    // PTFS coordinates
        'IIAB': { x: -720, y: 1750 },     // PTFS coordinates
        'IPAP': { x: -2100, y: 2890 },    // PTFS coordinates
        'IGRV': { x: -980, y: 1560 },     // PTFS coordinates
        'IJAF': { x: -2450, y: 3210 },    // PTFS coordinates
        'IZOL': { x: -2890, y: 2780 },    // PTFS coordinates
        'ISCM': { x: -2340, y: 2100 },    // PTFS coordinates
        'IDCS': { x: -450, y: 2690 },     // PTFS coordinates
        'ITKO': { x: -1670, y: 1340 },    // PTFS coordinates
        'ILKL': { x: -1234, y: 3450 },    // PTFS coordinates
        'IPPH': { x: -3200, y: 2100 },    // PTFS coordinates
        'IGAR': { x: -2100, y: 3890 },    // PTFS coordinates
        'IBLT': { x: -560, y: 2340 },     // PTFS coordinates
        'IRFD': { x: -2780, y: 3100 },    // PTFS coordinates
        'IMLR': { x: -890, y: 1450 },     // PTFS coordinates
        'ITRC': { x: -2890, y: 4100 },    // PTFS coordinates
        'IBTH': { x: -1890, y: 2450 },    // PTFS coordinates
        'IUFO': { x: -2560, y: 3200 },    // PTFS coordinates
        'ISAU': { x: -670, y: 3100 },     // PTFS coordinates
        'ISKP': { x: -3100, y: 4000 }     // PTFS coordinates
    }
};

// Enhanced coordinate helper with airport definition
function setupCoordinateHelper() {
    console.log("🗺️ Map Coordinate Helper Active!");
    console.log("📋 INSTRUCTIONS:");
    console.log("1. Left-click on map to see coordinates");
    console.log("2. Right-click on airport locations to define them");
    console.log("3. Use exportAirportCoordinates() to get the code to copy");
    console.log("ℹ️  NOTE: Airports now use PTFS coordinates automatically");
    
    window.tempAirports = window.tempAirports || [];
    
    // Function to add coordinates to any map element
    function addCoordinateListener(mapElement) {
        if (!mapElement) return;
        
        // Left click - show coordinates
        mapElement.addEventListener('click', function(event) {
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to actual SVG coordinates
            const svgX = Math.round((x / rect.width) * MAP_CONFIG.mapWidth);
            const svgY = Math.round((y / rect.height) * MAP_CONFIG.mapHeight);
            
            // Convert back to PTFS coordinates for reference
            const mapCenterX = 600;
            const mapCenterY = 600;
            const ptfsXRange = 2750;
            const ptfsYRange = 2760;
            const mapScale = 900;
            
            const normalizedX = (svgX - (mapCenterX - mapScale/2)) / mapScale;
            const normalizedY = (svgY - (mapCenterY - mapScale/2)) / mapScale;
            const ptfsX = Math.round((normalizedX * ptfsXRange) - 3200);
            const ptfsY = Math.round((normalizedY * ptfsYRange) + 1340);
            
            console.log(`📍 Map Position: { x: ${svgX}, y: ${svgY} }`);
            console.log(`   PTFS Coords: { x: ${ptfsX}, z: ${ptfsY} }`);
            console.log(`   Copy this format: { x: ${ptfsX}, y: ${ptfsY} }`);
            
            // Create temporary marker
            createTempMarker(rect.left + x, rect.top + y, `${svgX}, ${svgY}`);
        });
        
        // Right click - add airport
        mapElement.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to PTFS coordinates
            const svgX = Math.round((x / rect.width) * MAP_CONFIG.mapWidth);
            const svgY = Math.round((y / rect.height) * MAP_CONFIG.mapHeight);
            
            const mapCenterX = 600;
            const mapCenterY = 600;
            const ptfsXRange = 2750;
            const ptfsYRange = 2760;
            const mapScale = 900;
            
            const normalizedX = (svgX - (mapCenterX - mapScale/2)) / mapScale;
            const normalizedY = (svgY - (mapCenterY - mapScale/2)) / mapScale;
            const ptfsX = Math.round((normalizedX * ptfsXRange) - 3200);
            const ptfsY = Math.round((normalizedY * ptfsYRange) + 1340);
            
            const airportCode = prompt("Enter airport code (e.g., IBAR):");
            if (airportCode) {
                addAirportCoordinate(airportCode.toUpperCase(), ptfsX, ptfsY);
                createTempMarker(rect.left + x, rect.top + y, airportCode, true);
                console.log(`✅ Added ${airportCode.toUpperCase()} at PTFS position { x: ${ptfsX}, z: ${ptfsY} }`);
            }
        });
    }
    
    // Auto-attach to existing map elements
    const gameMapElements = document.querySelectorAll('svg, object[type="image/svg+xml"], #gameMapImage');
    gameMapElements.forEach(addCoordinateListener);
    
    // Also watch for new map elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === 'SVG' || (node.tagName === 'OBJECT' && node.type === 'image/svg+xml')) {
                    addCoordinateListener(node);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function addAirportCoordinate(code, x, y) {
    window.tempAirports.push({ code, x: Math.round(x), y: Math.round(y) });
    console.log(`✈️ Added ${code}: { x: ${Math.round(x)}, y: ${Math.round(y)} } (PTFS coords)`);
    console.log("📋 Copy this line to map_config.js:");
    console.log(`        '${code}': { x: ${Math.round(x)}, y: ${Math.round(y)} },`);
}

function exportAirportCoordinates() {
    if (window.tempAirports && window.tempAirports.length > 0) {
        console.log("📋 COPY ALL AIRPORT COORDINATES TO MAP_CONFIG.JS:");
        console.log("========================================");
        window.tempAirports.forEach(airport => {
            console.log(`        '${airport.code}': { x: ${airport.x}, y: ${airport.y} },`);
        });
        console.log("========================================");
        console.log(`🎯 Total airports defined: ${window.tempAirports.length}`);
        console.log("ℹ️  These are PTFS coordinates - they will be auto-converted to map coordinates");
    } else {
        console.log("❌ No airports defined yet. Right-click on map to add airports.");
    }
}

function createTempMarker(x, y, label, permanent = false) {
    const marker = document.createElement('div');
    marker.style.position = 'fixed';
    marker.style.left = (x - 8) + 'px';
    marker.style.top = (y - 8) + 'px';
    marker.style.width = '16px';
    marker.style.height = '16px';
    marker.style.backgroundColor = permanent ? '#50c878' : '#ff4444';
    marker.style.border = '2px solid white';
    marker.style.borderRadius = '50%';
    marker.style.zIndex = '10000';
    marker.style.pointerEvents = 'none';
    marker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    
    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.style.position = 'absolute';
    labelDiv.style.top = '20px';
    labelDiv.style.left = '50%';
    labelDiv.style.transform = 'translateX(-50%)';
    labelDiv.style.background = 'rgba(0,0,0,0.8)';
    labelDiv.style.color = 'white';
    labelDiv.style.padding = '2px 6px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.fontSize = '10px';
    labelDiv.style.fontWeight = 'bold';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.textContent = label;
    marker.appendChild(labelDiv);
    
    document.body.appendChild(marker);
    
    // Remove marker after delay
    setTimeout(() => marker.remove(), permanent ? 10000 : 3000);
}

// Export for use in main template
window.MAP_CONFIG = MAP_CONFIG;
window.setupCoordinateHelper = setupCoordinateHelper;

