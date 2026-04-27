# jellyfin-plugin-studio-showcase

<p align="center">
  <img src="logo.png" alt="AxFlix Studios Logo" width="300"/>
</p>

This plugin enhances your Jellyfin interface by adding a beautifully animated row of studios and franchises directly on your Jellyfin home page.

## Features

- **Studio & Franchise Showcase**: Display studio logos gracefully on your homepage.
- **Hover Video Intros**: Play a short introductory video or animation when a user hovers over a studio logo.
- **Smart Deduplication**: Merges variants of the same studio automatically (e.g. "Disney", "Walt Disney", "Walt Disney Pictures").
- **Native Navigation**: Clicking a studio takes you to the native Jellyfin library filter, showing all movies for that specific studio natively.

## Recommended Plugins & Setup

The AxFlix Studio Plugin is completely autonomous, but for the **Video Hover** functionality to give its best result, your Jellyfin server must be populated with "Theme Videos".

1. **Theme Media Plugin** (Optional but Recommended): Install a "Theme Media" plugin from the official Jellyfin catalog to automatically download theme videos (`theme.mp4`) for your media.
2. **TMDb Box Sets** (Optional): Excellent for organizing your movie franchises (Marvel, Star Wars) which you can map as studios.

As long as Jellyfin detects "Theme Media" for a studio or franchise, the AxFlix plugin will be able to play it!

## Installation (Via Store)

This is the recommended method. It allows you to get automatic updates!

1. Open your Jellyfin Dashboard.
2. Navigate to **Plugins** (under the Advanced section), then click on the **Repositories** tab.
3. Click the **`+`** icon to add a new repository.
4. Fill in the fields:
   * **Repository Name**: `AxFlix Repository`
   * **Repository URL**: `https://raw.githubusercontent.com/axFury/AxFlix-Studio-Bar/main/manifest.json`
5. Click **Save**.
6. Go back to the **Catalog** tab.
7. Scroll down to the `General` category, and you will see **AxFlix Studios**. Click on it and press **Install**.
8. **Restart your Jellyfin server** so the plugin can load.

## Configuration

1. Once installed and restarted, navigate to your Jellyfin Dashboard.
2. Go to **Plugins**, and click on **AxFlix Studios**.
3. Open the configuration page to enable/disable specific studios, map aliases, or adjust settings.
4. Go back to your Jellyfin homepage, and enjoy your new Studio bar!

## Manual Installation (From Source)

If you are a developer or want to build it yourself:
1. Clone the repository on your Jellyfin server.
2. Ensure you have the **.NET 9.0 SDK** installed (`dotnet build`).
3. Run the deployment script: `sudo ./deploy.sh`

## License

MIT License. Feel free to fork, modify, and improve this plugin!
