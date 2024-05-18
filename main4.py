from flask import Flask, jsonify
import threading
import requests
from pynput import keyboard
import objc
from Cocoa import NSAlert, NSApplication, NSApp, NSRunningApplication, NSApplicationActivateIgnoringOtherApps, NSObject
from Foundation import NSThread
from flask import Flask, jsonify
import threading
import requests
from pynput import keyboard
import objc
from Cocoa import NSAlert, NSTextField, NSApplication, NSApp, NSRunningApplication, NSApplicationActivateIgnoringOtherApps, NSObject, NSWindow, NSBackingStoreBuffered, NSMakeRect, NSScreen
from Foundation import NSThread

app = Flask(__name__)

@app.route('/show_message')
def show_message_route():
    message = "Hello, I'm ChatGPT! How can I help you today?"
    return jsonify(message=message)

def run_flask():
    app.run(port=5000, debug=False)

def show_message():
    try:
        response = requests.get('http://127.0.0.1:5000/show_message')
        response.raise_for_status()
        data = response.json()
        message = data.get('message', 'No message received')
        
        # Call show_alert on the main thread
        NSThread.performSelectorOnMainThread_withObject_waitUntilDone_(
            objc.selector(show_alert, signature=b'v@:@'), message, False)
    except requests.RequestException as e:
        print(f"Error fetching message: {e}")

def show_window(message):
    # Initialize the application to display the window
    app = NSApplication.sharedApplication()
    NSApp.activateIgnoringOtherApps_(True)

    # Create and configure the window
    window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
        NSMakeRect(100, 100, 400, 200),
        NSWindow.NSWindowStyleMaskTitled | NSWindow.NSWindowStyleMaskClosable,
        NSBackingStoreBuffered,
        False
    )
    window.setTitle_("ChatGPT Message")
    window.makeKeyAndOrderFront_(None)

    # Create a text field to display the message
    text_field = NSTextField.alloc().initWithFrame_(window.contentView().bounds())
    text_field.setStringValue_(message)
    text_field.setEditable_(False)
    text_field.setDrawsBackground_(False)
    window.contentView().addSubview_(text_field)


def on_activate():
    show_message()

def listen_for_hotkey():
    with keyboard.GlobalHotKeys({
        '<ctrl>+<space>': on_activate
    }) as h:
        print("Listening for hotkey (Ctrl + Space)... Press Esc to stop.")
        h.join()

if __name__ == '__main__':
    # Ensure the app is in the foreground
    NSRunningApplication.currentApplication().activateWithOptions_(NSApplicationActivateIgnoringOtherApps)
    
    # Run the Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

    # Run the hotkey listener in the main thread
    listen_for_hotkey()
