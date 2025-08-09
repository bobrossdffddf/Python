
// Map Configuration for PTFS Game Map
// SVG format with simplified coordinate system: 0,0 in-game = 0,0 in SVG, 1px = 100 studs

const MAP_CONFIG = {
    // Path to your game map SVG file
    gameMapPath: '/static/maps/game_map.svg',
    
    // Map dimensions - expanded to show full game world
    mapWidth: 1200,
    mapHeight: 1000,
    
    // SVG viewBox to show the entire game area (adjust these based on your map bounds)
    viewBox: "-400 -500 1200 1000", // x, y, width, height
    
    // Simplified coordinate system: 1px = 100 studs
    // No offset needed, direct coordinate mapping
    coordinateScale: 100, // 1 SVG pixel = 100 game studs
    
    // Airport positions using direct PTFS coordinates converted to SVG pixels
    // Formula: SVG_coordinate = PTFS_coordinate / 100
    airportMapCoordinates: {
        'IBAR': { x: -12.5, y: 21 },    // PTFS: -1250, 2100
        'IHEN': { x: -8.9, y: 18.9 },   // PTFS: -890, 1890
        'ILAR': { x: -15.4, y: 22.5 },  // PTFS: -1540, 2250
        'IIAB': { x: -7.2, y: 17.5 },   // PTFS: -720, 1750
        'IPAP': { x: -21, y: 28.9 },    // PTFS: -2100, 2890
        'IGRV': { x: -9.8, y: 15.6 },   // PTFS: -980, 1560
        'IJAF': { x: -24.5, y: 32.1 },  // PTFS: -2450, 3210
        'IZOL': { x: -28.9, y: 27.8 },  // PTFS: -2890, 2780
        'ISCM': { x: -23.4, y: 21 },    // PTFS: -2340, 2100
        'IDCS': { x: -4.5, y: 26.9 },   // PTFS: -450, 2690
        'ITKO': { x: -16.7, y: 13.4 },  // PTFS: -1670, 1340
        'ILKL': { x: -12.34, y: 34.5 }, // PTFS: -1234, 3450
        'IPPH': { x: -32, y: 21 },      // PTFS: -3200, 2100
        'IGAR': { x: -21, y: 38.9 },    // PTFS: -2100, 3890
        'IBLT': { x: -5.6, y: 23.4 },   // PTFS: -560, 2340
        'IRFD': { x: -27.8, y: 31 },    // PTFS: -2780, 3100
        'IMLR': { x: -8.9, y: 14.5 },   // PTFS: -890, 1450
        'ITRC': { x: -28.9, y: 41 },    // PTFS: -2890, 4100
        'IBTH': { x: -18.9, y: 24.5 },  // PTFS: -1890, 2450
        'IUFO': { x: -25.6, y: 32 },    // PTFS: -2560, 3200
        'ISAU': { x: -6.7, y: 31 },     // PTFS: -670, 3100
        'ISKP': { x: -31, y: 40 }       // PTFS: -3100, 4000
    }
};

// Enhanced coordinate helper with airport definition
function setupCoordinateHelper() {
    console.log("🗺️ Map Coordinate Helper Active!");
    console.log("Right-click on map to add airport coordinates");
    console.log("Left-click to get coordinates");
    
    window.tempAirports = window.tempAirports || [];
    
    // Function to add coordinates to any map element
    function addCoordinateListener(mapElement) {
        if (!mapElement) return;
        
        // Left click - show coordinates
        mapElement.addEventListener('click', function(event) {
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to SVG coordinates (accounting for scaling)
            const svgX = (x / rect.width) * MAP_CONFIG.mapWidth - 400;
            const svgY = (y / rect.height) * MAP_CONFIG.mapHeight - 500;
            
            console.log(`📍 Clicked at SVG coords: { x: ${svgX.toFixed(1)}, y: ${svgY.toFixed(1)} }`);
            console.log(`   Screen coords: { x: ${x}, y: ${y} }`);
            
            // Create temporary marker
            createTempMarker(rect.left + x, rect.top + y, `${svgX.toFixed(1)}, ${svgY.toFixed(1)}`);
        });
        
        // Right click - add airport
        mapElement.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            
            const rect = mapElement.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            // Convert to SVG coordinates
            const svgX = (x / rect.width) * MAP_CONFIG.mapWidth - 400;
            const svgY = (y / rect.height) * MAP_CONFIG.mapHeight - 500;
            
            const airportCode = prompt("Enter airport code (e.g., IBAR):");
            if (airportCode) {
                addAirportCoordinate(airportCode.toUpperCase(), svgX, svgY);
                createTempMarker(rect.left + x, rect.top + y, airportCode, true);
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
    window.tempAirports.push({ code, x: x.toFixed(1), y: y.toFixed(1) });
    console.log(`✈️ Added ${code}: { x: ${x.toFixed(1)}, y: ${y.toFixed(1)} }`);
    console.log("📋 Copy this to your map_config.js:");
    console.log(`'${code}': { x: ${x.toFixed(1)}, y: ${y.toFixed(1)} },`);
}

function exportAirportCoordinates() {
    if (window.tempAirports && window.tempAirports.length > 0) {
        console.log("📋 All airport coordinates:");
        window.tempAirports.forEach(airport => {
            console.log(`'${airport.code}': { x: ${airport.x}, y: ${airport.y} },`);
        });
    } else {
        console.log("No airports defined yet. Right-click on map to add airports.");
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
