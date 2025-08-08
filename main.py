
import json
import random
import asyncio
import websockets
import PySimpleGUI as sg
import threading
import queue
import time
from datetime import datetime

DEFAULT_HEADING = 180
SLOWDOWN_RATE = 0.02

def generate_squawk():
    return "".join(str(random.randint(0, 7)) for _ in range(4))

def make_clearance(flightplan):
    callsign = flightplan["callsign"]
    arriving = flightplan["arriving"]
    flightlevel = int(flightplan["flightlevel"])
    squawk = generate_squawk()

    return (
        f"{callsign}, cleared IRF to {arriving} airport as filed.\n"
        f"Climb and maintain {flightlevel * 100} feet.\n"
        f"After departure maintain {DEFAULT_HEADING} heading\n"
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

msg_queue = queue.Queue()
flights_history = []

async def websocket_listener(queue):
    url = "wss://24data.ptfs.app/wss"
    while True:
        try:
            async with websockets.connect(url) as ws:
                queue.put(("[STATUS]", "Connected to ATC 24 feed.", None))
                async for message in ws:
                    try:
                        packet = json.loads(message)
                        if packet.get("t") in ["FLIGHT_PLAN", "EVENT_FLIGHT_PLAN"]:
                            flightplan = packet["d"]
                            clearance = make_clearance(flightplan)
                            timestamp = datetime.now().strftime("%H:%M:%S")
                            
                            # Add to history
                            flight_info = {
                                "timestamp": timestamp,
                                "callsign": flightplan["callsign"],
                                "aircraft": flightplan["aircraft"],
                                "departing": flightplan["departing"],
                                "arriving": flightplan["arriving"],
                                "flightlevel": flightplan["flightlevel"],
                                "clearance": clearance
                            }
                            flights_history.append(flight_info)
                            
                            queue.put(("CLEARANCE", clearance, flight_info))
                    except Exception as e:
                        queue.put(("[ERROR]", f"Processing message: {e}", None))
        except Exception as e:
            queue.put(("[ERROR]", f"Connection error: {e}. Reconnecting in 5 seconds...", None))
            await asyncio.sleep(5)

def start_ws_loop(loop, queue):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websocket_listener(queue))

def format_flight_for_table(flight):
    return [
        flight["timestamp"],
        flight["callsign"],
        flight["aircraft"],
        flight["departing"],
        flight["arriving"],
        flight["flightlevel"]
    ]

# GUI Layout
sg.theme('DarkBlue3')

clearance_tab = [
    [sg.Text("Live Clearances:", font=('Arial', 12, 'bold'))],
    [sg.Multiline(size=(90, 15), key="-OUTPUT-", autoscroll=True, disabled=True, font=('Courier', 10))]
]

flights_tab = [
    [sg.Text("Flight History:", font=('Arial', 12, 'bold'))],
    [sg.Table(values=[], headings=["Time", "Callsign", "Aircraft", "From", "To", "FL"],
              key="-FLIGHTS-TABLE-", auto_size_columns=True, justification='left',
              num_rows=20, alternating_row_color='lightblue')],
    [sg.Button("Clear History"), sg.Button("Export History")]
]

layout = [
    [sg.TabGroup([[sg.Tab('Live Clearances', clearance_tab),
                   sg.Tab('Flight History', flights_tab)]])],
    [sg.StatusBar("Disconnected", key="-STATUS-", size=(50, 1))],
    [sg.Button("Exit")]
]

window = sg.Window("ATC 24 Clearance Generator", layout, resizable=True, finalize=True)

# Start websocket listener in separate thread with its own event loop
loop = asyncio.new_event_loop()
ws_thread = threading.Thread(target=start_ws_loop, args=(loop, msg_queue), daemon=True)
ws_thread.start()

while True:
    event, values = window.read(timeout=100)
    
    if event == sg.WIN_CLOSED or event == "Exit":
        break
    
    if event == "Clear History":
        flights_history.clear()
        window["-FLIGHTS-TABLE-"].update(values=[])
    
    if event == "Export History":
        if flights_history:
            filename = sg.popup_get_file("Save flight history as", save_as=True, 
                                       file_types=(("JSON Files", "*.json"), ("All Files", "*.*")))
            if filename:
                try:
                    with open(filename, 'w') as f:
                        json.dump(flights_history, f, indent=2)
                    sg.popup(f"History exported to {filename}")
                except Exception as e:
                    sg.popup_error(f"Error saving file: {e}")

    # Read all messages from queue and update GUI
    while not msg_queue.empty():
        msg_type, msg, flight_info = msg_queue.get()
        
        if msg_type == "[STATUS]":
            window["-STATUS-"].update("Connected")
            current = window["-OUTPUT-"].get()
            window["-OUTPUT-"].update(current + f"\n[{datetime.now().strftime('%H:%M:%S')}] {msg}")
        
        elif msg_type == "[ERROR]":
            window["-STATUS-"].update("Error")
            current = window["-OUTPUT-"].get()
            window["-OUTPUT-"].update(current + f"\n[{datetime.now().strftime('%H:%M:%S')}] {msg}")
        
        elif msg_type == "CLEARANCE":
            current = window["-OUTPUT-"].get()
            timestamp = datetime.now().strftime('%H:%M:%S')
            window["-OUTPUT-"].update(current + f"\n[{timestamp}] {msg}")
            
            # Update flights table
            table_data = [format_flight_for_table(flight) for flight in flights_history[-50:]]  # Show last 50 flights
            window["-FLIGHTS-TABLE-"].update(values=table_data)

window.close()
