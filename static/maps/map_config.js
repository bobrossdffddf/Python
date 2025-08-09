
// Map Configuration for PTFS Game Map
// SVG format with simplified coordinate system: 0,0 in-game = 0,0 in SVG, 1px = 100 studs

const MAP_CONFIG = {
    // Path to your game map SVG file
    gameMapPath: '/static/maps/game_map.svg',
    
    // Actual SVG map dimensions from your file
    mapWidth: 964,
    mapHeight: 921,
    
    // SVG viewBox matches your map's actual viewBox
    viewBox: "0 0 964 921", // x, y, width, height
    
    // Coordinate system: Direct pixel mapping to your SVG
    coordinateScale: 1, // 1 SVG pixel = 1 pixel on your map
    
    // Airport positions - YOU NEED TO DEFINE THESE BY CLICKING ON YOUR MAP
    // Use the coordinate helper tool to find the correct X,Y positions for each airport
    // Right-click on the map where each airport is located to get coordinates
    airportMapCoordinates: {
        // EXAMPLE COORDINATES - REPLACE THESE WITH ACTUAL POSITIONS FROM YOUR MAP
        // Use the coordinate helper by clicking the 📍 button in fullscreen mode
        'IBAR': { x: 400, y: 300 },    // Replace with actual position
        'IHEN': { x: 450, y: 280 },    // Replace with actual position
        'ILAR': { x: 350, y: 250 },    // Replace with actual position
        'IIAB': { x: 500, y: 320 },    // Replace with actual position
        'IPAP': { x: 200, y: 200 },    // Replace with actual position
        'IGRV': { x: 420, y: 350 },    // Replace with actual position
        'IJAF': { x: 150, y: 150 },    // Replace with actual position
        'IZOL': { x: 100, y: 180 },    // Replace with actual position
        'ISCM': { x: 250, y: 300 },    // Replace with actual position
        'IDCS': { x: 550, y: 250 },    // Replace with actual position
        'ITKO': { x: 380, y: 380 },    // Replace with actual position
        'ILKL': { x: 320, y: 120 },    // Replace with actual position
        'IPPH': { x: 50, y: 300 },     // Replace with actual position
        'IGAR': { x: 200, y: 100 },    // Replace with actual position
        'IBLT': { x: 520, y: 290 },    // Replace with actual position
        'IRFD': { x: 180, y: 200 },    // Replace with actual position
        'IMLR': { x: 450, y: 370 },    // Replace with actual position
        'ITRC': { x: 100, y: 80 },     // Replace with actual position
        'IBTH': { x: 300, y: 270 },    // Replace with actual position
        'IUFO': { x: 220, y: 180 },    // Replace with actual position
        'ISAU': { x: 480, y: 220 },    // Replace with actual position
        'ISKP': { x: 80, y: 100 }      // Replace with actual position
    }
};

// Enhanced coordinate helper with airport definition
function setupCoordinateHelper() {
    console.log("🗺️ Map Coordinate Helper Active!");
    console.log("📋 INSTRUCTIONS:");
    console.log("1. Left-click on map to see coordinates");
    console.log("2. Right-click on airport locations to define them");
    console.log("3. Use exportAirportCoordinates() to get the code to copy");
    
    window.tempAirports = window.tempAirports || [];
    
    // Function to add coordinates to any map element
    function addCoordinateListener(mapElement) {
        if (!mapElement) return;
        
        // Left click - show coordinates
        mapElement.addEventListener('click', function(event) {
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to actual SVG coordinates (1:1 mapping for 964x921 map)
            const svgX = Math.round((x / rect.width) * MAP_CONFIG.mapWidth);
            const svgY = Math.round((y / rect.height) * MAP_CONFIG.mapHeight);
            
            console.log(`📍 Map Position: { x: ${svgX}, y: ${svgY} }`);
            console.log(`   Screen coords: { x: ${x}, y: ${y} }`);
            console.log(`   Copy this format: { x: ${svgX}, y: ${svgY} }`);
            
            // Create temporary marker
            createTempMarker(rect.left + x, rect.top + y, `${svgX}, ${svgY}`);
        });
        
        // Right click - add airport
        mapElement.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to actual SVG coordinates (1:1 mapping)
            const svgX = Math.round((x / rect.width) * MAP_CONFIG.mapWidth);
            const svgY = Math.round((y / rect.height) * MAP_CONFIG.mapHeight);
            
            const airportCode = prompt("Enter airport code (e.g., IBAR):");
            if (airportCode) {
                addAirportCoordinate(airportCode.toUpperCase(), svgX, svgY);
                createTempMarker(rect.left + x, rect.top + y, airportCode, true);
                console.log(`✅ Added ${airportCode.toUpperCase()} at position { x: ${svgX}, y: ${svgY} }`);
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
    console.log(`✈️ Added ${code}: { x: ${Math.round(x)}, y: ${Math.round(y)} }`);
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
