
// Map Configuration for PTFS Game Map
// SVG format with simplified coordinate system: 0,0 in-game = 0,0 in SVG, 1px = 100 studs

const MAP_CONFIG = {
    // Path to your game map SVG file
    gameMapPath: '/static/maps/game_map.svg',
    
    // Map dimensions (SVG viewBox, content may extend beyond)
    mapWidth: 800,
    mapHeight: 600,
    
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

// Function to help you find coordinates
function setupCoordinateHelper() {
    console.log("Map Coordinate Helper Active!");
    console.log("Click on your map to get coordinates for airports");
    
    const mapImage = document.getElementById('gameMapImage');
    if (mapImage) {
        mapImage.addEventListener('click', function(event) {
            const rect = mapImage.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            
            console.log(`Clicked at: { x: ${x}, y: ${y} }`);
            
            // Create a temporary marker
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = (rect.left + x - 5) + 'px';
            marker.style.top = (rect.top + y - 5) + 'px';
            marker.style.width = '10px';
            marker.style.height = '10px';
            marker.style.backgroundColor = 'red';
            marker.style.borderRadius = '50%';
            marker.style.zIndex = '9999';
            marker.style.pointerEvents = 'none';
            document.body.appendChild(marker);
            
            // Remove marker after 3 seconds
            setTimeout(() => marker.remove(), 3000);
        });
    }
}

// Export for use in main template
window.MAP_CONFIG = MAP_CONFIG;
window.setupCoordinateHelper = setupCoordinateHelper;
