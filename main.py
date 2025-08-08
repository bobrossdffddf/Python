import json
import random
import asyncio
import websockets
import threading
import time
import math
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_file
import io

DEFAULT_HEADING = 180
SLOWDOWN_RATE = 0.02

# Airport coordinates for distance calculations
AIRPORT_COORDINATES = {
    'IBAR': {'lat': 25.7617, 'lng': -80.1918},
    'IHEN': {'lat': 25.7753, 'lng': -80.1348},
    'ILAR': {'lat': 25.7889, 'lng': -80.2264},
    'IIAB': {'lat': 25.8067, 'lng': -80.0969},
    'IPAP': {'lat': 25.6586, 'lng': -80.2878},
    'IGRV': {'lat': 25.9123, 'lng': -80.1456},
    'IJAF': {'lat': 25.5434, 'lng': -80.3421},
    'IZOL': {'lat': 25.7234, 'lng': -80.4123},
    'ISCM': {'lat': 25.8234, 'lng': -80.3567},
    'IDCS': {'lat': 25.6789, 'lng': -80.0234},
    'ITKO': {'lat': 25.9876, 'lng': -80.2345},
    'ILKL': {'lat': 25.4567, 'lng': -80.1789},
    'IPPH': {'lat': 25.8901, 'lng': -80.4567},
    'IGAR': {'lat': 25.3456, 'lng': -80.2890},
    'IBLT': {'lat': 25.7890, 'lng': -80.0456},
    'IRFD': {'lat': 25.6123, 'lng': -80.3789},
    'IMLR': {'lat': 25.9234, 'lng': -80.1234},
    'ITRC': {'lat': 25.4789, 'lng': -80.4012},
    'IBTH': {'lat': 25.8567, 'lng': -80.2678},
    'IUFO': {'lat': 25.7345, 'lng': -80.3456},
    'ISAU': {'lat': 25.5678, 'lng': -80.0789},
    'ISKP': {'lat': 25.8012, 'lng': -80.4234}
}

def convert_ptfs_to_latlng(ptfs_x, ptfs_y):
    """Convert PTFS coordinates to lat/lng"""
    center_lat = 25.7617
    center_lng = -80.1918
    scale = 0.001
    
    lat = center_lat + (ptfs_y * scale)
    lng = center_lng + (ptfs_x * scale)
    
    return lat, lng

def calculate_distance_miles(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in miles using Haversine formula"""
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in miles
    radius_miles = 3959
    
    distance = radius_miles * c
    return distance

def get_aircraft_distance_to_airport(callsign, airport_code):
    """Get distance from aircraft to destination airport"""
    global aircraft_data
    
    if not aircraft_data or callsign not in aircraft_data:
        return None
        
    if airport_code not in AIRPORT_COORDINATES:
        return None
        
    aircraft = aircraft_data[callsign]
    if not aircraft.get('position'):
        return None
        
    # Convert PTFS coordinates to lat/lng
    aircraft_lat, aircraft_lng = convert_ptfs_to_latlng(
        aircraft['position']['x'], 
        aircraft['position'].get('z', aircraft['position'].get('y', 0))
    )
    
    # Get airport coordinates
    airport = AIRPORT_COORDINATES[airport_code]
    
    # Calculate distance
    distance = calculate_distance_miles(
        aircraft_lat, aircraft_lng,
        airport['lat'], airport['lng']
    )
    
    return distance

def generate_squawk():
    return "".join(str(random.randint(0, 7)) for _ in range(4))

def make_clearance(flightplan, runway="___"):
    callsign = flightplan["callsign"]
    arriving = flightplan["arriving"]
    flightlevel = int(flightplan["flightlevel"])
    squawk = generate_squawk()

    return (
        f"{callsign}, cleared IFR to {arriving} airport as filed.\n"
        f"Clear for runway {runway}.\n"
        f"Climb and maintain {flightlevel * 100} feet.\n"
        f"After departure maintain heading\n"
        f"Squawk {squawk}.\n"
    )

MOCK_FLIGHTPLAN = {
    "robloxName": "PTC_Helper",
    "callsign": "Shamrock-1337",
    "realcallsign": "Shamrock-1337",
    "aircraft": "A330",
    "flightrules": "IFR",
    "departing": "IMLR",
    "arriving": "IGRV",
    "route": "N/A",
    "flightlevel": "040"
}

app = Flask(__name__)
flights_history = []
status_log = []
connection_status = "Disconnected"
connected_flights = {} # For tracking new flight plans to specific airports
aircraft_data = {} # For storing live aircraft data

async def websocket_listener():
    global connection_status
    url = "wss://24data.ptfs.app/wss"
    connection_logged = False
    while True:
        try:
            async with websockets.connect(url) as ws:
                if not connection_logged:
                    connection_status = "Connected"
                    status_log.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "message": "Connected to ATC 24 feed."
                    })
                    connection_logged = True
                async for message in ws:
                    try:
                        packet = json.loads(message)
                        
                        # Handle flight plans
                        if packet.get("t") in ["FLIGHT_PLAN", "EVENT_FLIGHT_PLAN"]:
                            flightplan = packet["d"]
                            # Use default runway placeholder for new flights - will be updated by frontend
                            clearance = make_clearance(flightplan, "___")
                            timestamp = datetime.now().strftime("%H:%M:%S")

                            # Add to history
                            squawk = generate_squawk()
                            flight_info = {
                                "timestamp": timestamp,
                                "callsign": flightplan["callsign"],
                                "aircraft": flightplan["aircraft"],
                                "departing": flightplan["departing"],
                                "arriving": flightplan["arriving"],
                                "flightlevel": flightplan["flightlevel"],
                                "route": flightplan.get("route", "N/A"),
                                "clearance": clearance
                            }
                            flights_history.append(flight_info)

                            # Keep only last 100 flights
                            if len(flights_history) > 100:
                                flights_history.pop(0)

                        # Handle aircraft data for live map
                        elif packet.get("t") in ["ACFT_DATA", "EVENT_ACFT_DATA"]:
                            global aircraft_data
                            aircraft_data = packet["d"]  # This is the aircraft data object

                    except Exception as e:
                        status_log.append({
                            "timestamp": datetime.now().strftime("%H:%M:%S"),
                            "message": f"Processing message error: {e}"
                        })
        except Exception as e:
            connection_status = "Error"
            connection_logged = False
            status_log.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "message": f"Connection error: {e}. Reconnecting in 5 seconds..."
            })
            await asyncio.sleep(5)

def start_ws_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websocket_listener())

@app.route('/')
def index():
    # This route would typically serve your HTML file, which might include JavaScript
    # to set an airport filter cookie and handle audio playback.
    return render_template('index.html')

@app.route('/api/flights')
def get_flights():
    flights_to_return = []
    
    # If filtering is active, remove clearance for arriving flights to the filtered airport
    if current_airport_filter:
        for flight in flights_history[-50:]:
            flight_copy = flight.copy()
            if flight["arriving"] == current_airport_filter:
                flight_copy.pop("clearance", None)  # Remove clearance for arriving flights
                flight_copy["is_arriving_to_filter"] = True  # Mark for red styling
                
                # Calculate distance to destination airport for arriving flights
                distance = get_aircraft_distance_to_airport(flight["callsign"], flight["arriving"])
                if distance is not None:
                    flight_copy["distance_to_destination"] = round(distance, 1)
                else:
                    flight_copy["distance_to_destination"] = None
            else:
                flight_copy["is_arriving_to_filter"] = False
                flight_copy["distance_to_destination"] = None
            flights_to_return.append(flight_copy)
    else:
        flights_to_return = [flight.copy() for flight in flights_history[-50:]]
        for flight in flights_to_return:
            flight["is_arriving_to_filter"] = False
            # For non-filtered view, still calculate distance for arriving flights
            if aircraft_data:
                distance = get_aircraft_distance_to_airport(flight["callsign"], flight["arriving"])
                if distance is not None:
                    flight["distance_to_destination"] = round(distance, 1)
                else:
                    flight["distance_to_destination"] = None
            else:
                flight["distance_to_destination"] = None
    
    return jsonify(flights_to_return)

@app.route('/api/status')
def get_status():
    return jsonify({
        "connection_status": connection_status,
        "total_flights": len(flights_history),
        "status_log": status_log[-10:]
    })

@app.route('/api/generate_clearance', methods=['POST'])
def generate_clearance():
    try:
        data = request.json
        flightplan = data.get('flightplan', {})
        runway = data.get('runway', '___')
        
        clearance = make_clearance(flightplan, runway)
        timestamp = datetime.now().strftime("%H:%M:%S")
        squawk = generate_squawk()

        flight_info = {
            "timestamp": timestamp,
            "callsign": flightplan["callsign"],
            "aircraft": flightplan["aircraft"],
            "departing": flightplan["departing"],
            "arriving": flightplan["arriving"],
            "flightlevel": flightplan["flightlevel"],
            "route": flightplan.get("route", "N/A"),
            "squawk": squawk,
            "clearance": clearance
        }
        flights_history.append(flight_info)

        return jsonify({"success": True, "clearance": clearance, "flight": flight_info})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/update_runway', methods=['POST'])
def update_runway():
    """Update runway for existing flights"""
    try:
        data = request.json
        runway = data.get('runway', '___')
        
        # Update all flights with new runway clearance
        for flight in flights_history:
            original_flightplan = {
                'callsign': flight['callsign'],
                'arriving': flight['arriving'],
                'flightlevel': flight['flightlevel']
            }
            flight['clearance'] = make_clearance(original_flightplan, runway)
            
        return jsonify({"success": True, "message": f"Updated runway to {runway}"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    global flights_history
    flights_history = []
    return jsonify({"success": True})

@app.route('/api/export_history')
def export_history():
    output = io.StringIO()
    json.dump(flights_history, output, indent=2)
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='application/json',
        as_attachment=True,
        download_name=f'flight_history_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    )

# Global variable to store current filter
current_airport_filter = None

@app.route('/api/set_airport_filter', methods=['POST'])
def set_airport_filter():
    global current_airport_filter
    data = request.json
    airport_code = data.get("airport_code")
    if airport_code:
        current_airport_filter = airport_code
        status_log.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "message": f"Airport filter set to: {airport_code}"
        })
        return jsonify({"success": True, "message": f"Filter set for {airport_code}"})
    return jsonify({"success": False, "message": "No airport code provided"}), 400

@app.route('/api/get_airport_filter')
def get_airport_filter():
    return jsonify({"filter": current_airport_filter})

@app.route('/api/aircraft')
def get_aircraft():
    """Get live aircraft data for the map"""
    return jsonify(aircraft_data)

if __name__ == '__main__':
    ws_thread = threading.Thread(target=start_ws_loop, daemon=True)
    ws_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=False)