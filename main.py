import json
import random
import asyncio
import websockets
import PySimpleGUI as sg
import threading
import queue
import time

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

async def websocket_listener(queue):
    url = "wss://24data.ptfs.app/wss"
    while True:
        try:
            async with websockets.connect(url) as ws:
                queue.put("[STATUS] Connected to ATC 24 feed.")
                async for message in ws:
                    try:
                        packet = json.loads(message)
                        if packet.get("t") in ["FLIGHT_PLAN", "EVENT_FLIGHT_PLAN"]:
                            flightplan = packet["d"]
                            clearance = make_clearance(flightplan)
                            queue.put(clearance)
                    except Exception as e:
                        queue.put(f"[ERROR] Processing message: {e}")
        except Exception as e:
            queue.put(f"[ERROR] Connection error: {e}. Reconnecting in 5 seconds...")
            await asyncio.sleep(5)

def start_ws_loop(loop, queue):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websocket_listener(queue))

# GUI
layout = [
    [sg.Multiline(size=(80, 20), key="-OUTPUT-", autoscroll=True, disabled=True)],
    [sg.Button("Exit")]
]

window = sg.Window("ATC 24 Clearance Generator", layout)

# Start websocket listener in separate thread with its own event loop
loop = asyncio.new_event_loop()
ws_thread = threading.Thread(target=start_ws_loop, args=(loop, msg_queue), daemon=True)
ws_thread.start()

while True:
    event, values = window.read(timeout=100)
    if event == sg.WIN_CLOSED or event == "Exit":
        break

    # Read all messages from queue and add to output
    while not msg_queue.empty():
        msg = msg_queue.get()
        current = window["-OUTPUT-"].get()
        window["-OUTPUT-"].update(current + "\n" + msg)

window.close()





