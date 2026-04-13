# AxFlix Studios Plugin for Jellyfin

This plugin enhances your Jellyfin interface by adding a beautifully animated row of studios and franchises directly on your Jellyfin home page.

## Features

- **Studio & Franchise Showcase**: Display studio logos gracefully on your homepage.
- **Hover Video Intros**: Play a short introductory video or animation when a user hovers over a studio logo.
- **Smart Deduplication**: Merges variants of the same studio automatically (e.g. "Disney", "Walt Disney", "Walt Disney Pictures").
- **Native Navigation**: Clicking a studio takes you to the native Jellyfin library filter, showing all movies for that specific studio natively.

## Installation

### Manual Installation (From Source)

1. Clone the repository on your Jellyfin server:
   ```bash
   git clone https://github.com/axFury/AxFlix-Studio-Bar.git
   ```
2. Navigate into the cloned folder:
   ```bash
   cd AxFlix-Studio-Bar
   ```
3. Ensure you have the **.NET 9.0 SDK** installed on your server (required to build Jellyfin 10.11.x plugins).
4. Run the deploy script (this script automatically builds the plugin, places the DLL in your Jellyfin plugins folder, and restarts the Jellyfin service):
   ```bash
   sudo ./deploy.sh
   ```
   *(Note: You may need to edit `deploy.sh` if your Jellyfin plugins directory is located somewhere other than `/var/lib/jellyfin/plugins`)*

### Setup

1. Once installed, navigate to your Jellyfin Dashboard.
2. Go to **Plugins**, and look for **AxFlix Studios**.
3. Open the configuration page to enable/disable specific studios, map aliases, or adjust settings.
4. Go back to your Jellyfin homepage, and enjoy your new Studio bar!

## Compatibility

- Designed for **Jellyfin 10.11.0.0** (Target ABI) and later.
- Compatible with all web-based clients that support Jellyfin's custom HTML/CSS injections.

## Development

If you wish to contribute or modify the plugin:
- C# Backend is heavily integrated with the Jellyfin Server API (`MediaBrowser.Controller`, `Common`, etc).
- The Javascript and CSS that power the hover effects and DOM injections are located in `AxFlix.Plugin/Web/`.

## License

MIT License. Feel free to fork, modify, and improve this plugin!
