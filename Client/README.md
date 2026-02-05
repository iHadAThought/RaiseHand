# RaiseHand — Discord video hand overlay (Client)

User-side **BetterDiscord** plugin that shows a **hand symbol** on your video when you're in the speaking queue. Works with the RaiseHand Discord bot.

## What it does

- When **you** type **/queue** or **/raise**, the hand appears on **your** video: you always see it on your self-view (overlay). Your queue number is shown in the blue badge.
- **/lower** → the hand is hidden.
- **Others with the plugin** see the hand on your video too: the bot posts the queue state in the channel, and each participant's plugin draws the hand overlay on the correct person's video (e.g. Person B's plugin draws the hand over Person A's video on B's screen).

### Who sees what (example)

All have cameras on and the plugin installed. **A** types /raise (first), then **B** types /raise (second).

| Viewer | On A's camera | On B's camera | On own self-view |
|--------|----------------|---------------|------------------|
| **A**  | —              | hand **2**    | hand **1**       |
| **B**  | hand **1**     | —             | hand **2**      |
| **C**  | hand **1**     | hand **2**    | —               |

So: you always see **your** queue number on your self-view; on everyone else's video you see **their** queue number.

## Requirements

- **BetterDiscord** installed: [betterdiscord.app](https://betterdiscord.app)

## Installation

1. Install BetterDiscord if you haven't already.
2. Copy `RaiseHand.plugin.js` into your BetterDiscord plugins folder:
   - **macOS:** `~/Library/Application Support/BetterDiscord/plugins`
   - **Windows:** `%appdata%\BetterDiscord\plugins`
   - **Linux:** `~/.config/BetterDiscord/plugins`
3. Open Discord → **Settings** → **Plugins**, enable **RaiseHand**.
4. Join a voice channel and turn on your camera. You should see the hand on your own video preview when you use /queue or /raise.

## Usage

1. Install the **RaiseHand bot** in your server (see **Server/README.md**) and invite it to your server.
2. In any channel where the bot is present, type **/queue** to raise your hand — the hand (and your queue number) appears on your video. Type **/lower** to hide it.
3. The hand is shown as an overlay on your preview. **Everyone in the channel who has the plugin** will see the hand on your video (their plugin draws it from the bot's queue state). For others without the plugin, use a virtual camera (e.g. OBS) if you need them to see the hand.

## Uninstall

1. **Settings** → **Plugins** → disable **RaiseHand**.
2. Delete `RaiseHand.plugin.js` from the plugins folder.

## License

Use and modify as you like.
