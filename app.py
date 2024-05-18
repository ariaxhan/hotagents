from flask import Flask, jsonify
import threading
import tkinter as tk
from tkinter import messagebox
import requests
from pynput import keyboard

app = Flask(__name__)

@app.route('/show_message')
def show_message_route():
    message = "Hello, you pressed Ctrl + Space!"
    return jsonify(message=message)

def run_flask():
    app.run(port=5000, debug=False)  # Disable reloader

def show_popup():
    try:
        response = requests.get('http://127.0.0.1:5000/show_message')
        response.raise_for_status()
        data = response.json()
        message = data.get('message', 'No message received')

        root = tk.Tk()
        root.withdraw()  # Hide the main window
        messagebox.showinfo("Hotkey Activated", message)
        root.destroy()
    except requests.RequestException as e:
        print(f"Error fetching message: {e}")

def on_activate():
    print("Hotkey activated!")
    show_popup()

def listen_for_hotkey():
    with keyboard.GlobalHotKeys({
            '<ctrl>+<space>': on_activate}) as h:
        print("Listening for hotkey (Ctrl + Space)... Press Esc to stop.")
        h.join()

if __name__ == '__main__':
    # Run the Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Run the hotkey listener in the main thread
    listen_for_hotkey()
