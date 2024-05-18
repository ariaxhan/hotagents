const { app } = require('electron');
const globalShortcut = require('node-global-shortcut');
const notifier = require('node-notifier');

app.whenReady().then(() => {
  // Register the global hotkey
  globalShortcut.register('Control+Space', () => {
    // Show the notification
    notifier.notify({
      title: 'Hotkey Activated',
      message: 'Hello, you pressed Ctrl + Space!'
    });
  });

  console.log('Listening for hotkey (Ctrl + Space)... Press Ctrl + C to stop.');
});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});
