# RaiseHand — Discord video hand overlay (Client)

User-side **BetterDiscord** plugin that shows a **hand symbol** on your video when you're in the speaking queue. Works with the RaiseHand Discord bot.

## What it does

- **/queue** (or **/raise**) in a channel where the bot is present → the hand appears on your video (overlay + stream), with your queue number.
- **/lower** → the hand is hidden.
- The plugin watches for the bot's ephemeral replies to toggle the hand; no extra setup.

## Requirements

- **BetterDiscord** installed: [betterdiscord.app](https://betterdiscord.app)

## Installation

1. Install BetterDiscord if you haven't already.
2. Copy `RaiseHand.plugin.js` into your BetterDiscord plugins folder:
   - **macOS:** `~/Library/Application Support/BetterDiscord/plugins`
   - **Windows:** `%appdata%\BetterDiscord\plugins`
   - **Linux:** `~/.config/BetterDiscord/plugins`
3. Open Discord → **Settings** → **Plugins**, enable **RaiseHand**.
4. Join a voice channel and turn on your camera. You should see the hand on your own video preview (and, when the stream hook works, others will see it too).

## Usage

1. Install the **RaiseHand bot** in your server (see **Server/README.md**) and invite it to your server.
2. In any channel where the bot is present, type **/queue** to raise your hand — the hand (and your queue number) appears on your video. Type **/lower** to hide it.
3. The hand is shown as an overlay on your preview and (when possible) composited into the stream others see.
4. If the hand doesn't appear after /queue: turn video **off** then **on** again so the plugin can attach.

## Uninstall

1. **Settings** → **Plugins** → disable **RaiseHand**.
2. Delete `RaiseHand.plugin.js` from the plugins folder.

## License

Use and modify as you like.
