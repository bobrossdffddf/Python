
// Map Configuration for PTFS Game Map
// Update these coordinates based on your actual game map

const MAP_CONFIG = {
    // Path to your game map image (add your map file here)
    gameMapPath: '/static/maps/game_map.png',
    
    // Map dimensions (update based on your image size)
    mapWidth: 800,
    mapHeight: 600,
    
    // PTFS world coordinate bounds (adjust based on your game world)
    ptfsBounds: {
        minX: -3500,
        maxX: 0,
        minZ: 0,
        maxZ: 4500
    },
    
    // Airport positions on your game map image (X,Y pixel coordinates)
    // TO UPDATE THESE:
    // 1. Open your game map image in an image editor
    // 2. Note the pixel coordinates of each airport
    // 3. Update the coordinates below
    airportMapCoordinates: {
        'IBAR': { x: 300, y: 200 },
        'IHEN': { x: 450, y: 180 },
        'ILAR': { x: 250, y: 150 },
        'IIAB': { x: 500, y: 220 },
        'IPAP': { x: 150, y: 100 },
        'IGRV': { x: 400, y: 250 },
        'IJAF': { x: 100, y: 80 },
        'IZOL': { x: 50, y: 120 },
        'ISCM': { x: 180, y: 200 },
        'IDCS': { x: 550, y: 150 },
        'ITKO': { x: 280, y: 280 },
        'ILKL': { x: 320, y: 70 },
        'IPPH': { x: 20, y: 200 },
        'IGAR': { x: 150, y: 50 },
        'IBLT': { x: 520, y: 190 },
        'IRFD': { x: 80, y: 130 },
        'IMLR': { x: 450, y: 270 },
        'ITRC': { x: 50, y: 30 },
        'IBTH': { x: 200, y: 170 },
        'IUFO': { x: 120, y: 110 },
        'ISAU': { x: 480, y: 130 },
        'ISKP': { x: 30, y: 40 }
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
