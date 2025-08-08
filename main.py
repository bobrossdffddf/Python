import json
import random
import asyncio
import websockets
import threading
import time
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_file
import io

DEFAULT_HEADING = 180
SLOWDOWN_RATE = 0.02

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
            else:
                flight_copy["is_arriving_to_filter"] = False
            flights_to_return.append(flight_copy)
    else:
        flights_to_return = [flight.copy() for flight in flights_history[-50:]]
        for flight in flights_to_return:
            flight["is_arriving_to_filter"] = False
    
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