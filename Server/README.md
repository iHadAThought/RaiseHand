# RaiseHand — D&D Discord Bot

A Discord bot that helps D&D groups manage speaking order with a **raise hands** queue. Players raise their hand when they want to speak, and the DM (or anyone) can call on people one at a time to keep things orderly. Visible queue positions are capped at **99** (internally the queue can be longer).

## Commands

| Command | Description |
|---------|-------------|
| `/queue` | Raise your hand — add yourself to the queue (shows hand on your video if you use the RaiseHand plugin) |
| `/raise` | Same as `/queue` — add yourself to the queue |
| `/lower` | Lower your hand — remove yourself from the queue (hides the hand in the plugin) |
| `/queuelist` | Show who has their hand raised (in order) |
| `/next` | Call on the next person in the queue |
| `/clear` | Clear the entire queue |

Each **channel** has its own queue, so you can run separate sessions in different channels.

## Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it (e.g., "RaiseHand")
3. Open **Bot** in the sidebar → **Add Bot**
4. Under **Token**, click **Reset Token** and copy it (keep it secret!)
5. Enable **Message Content Intent** is not required for slash commands
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`
7. Copy the generated URL, open it in a browser, and invite the bot to your server

### 2. Install and Configure

```bash
cd Server
npm install

# Copy the example env file
cp .env.example .env

# Edit .env and add:
# DISCORD_TOKEN=your_bot_token_here
```

Your Application ID is in the Developer Portal under **General Information** → **Application ID**. Add it to `.env` if you want to pre-register commands (optional — the bot registers them on startup):

```
DISCORD_APPLICATION_ID=your_application_id_here
```

### 3. Run the Bot

```bash
npm start
```

The bot will log in and register slash commands. They may take a few minutes to appear in Discord.

## Usage Tips for D&D

- **Session channel**: Use a dedicated text channel for your D&D session (e.g. `#dnd-session`)
- **Raise hands**: Players type `/queue` (or `/raise`) when they want to contribute; with the RaiseHand plugin (see **Client** folder) installed, the hand appears on their video
- **DM flow**: The DM uses `/next` to call on someone, then `/queuelist` to see who's waiting
- **Reset**: Use `/clear` between scenes or when starting fresh

## Compliance

RaiseHand is built to follow [Discord’s Terms of Service](https://discord.com/terms) and [Discord Developer Policy](https://dis.gd/discord-developer-policy):

- **Minimal intents:** Uses only the `Guilds` intent. No Message Content intent; the bot uses slash commands only.
- **No credentials:** Never requests or stores passwords, tokens, or other login data.
- **Data use:** Queue data (channel and user IDs, display names) is used only to run the queue and is kept in memory only—not stored on disk or shared with third parties. See [PRIVACY.md](PRIVACY.md) for details.
- **Reporting:** To report issues or policy concerns, open an issue in this repo or [report to Discord](https://support.discord.com/hc/en-us/requests/new).

For verification and bot directories, set your application’s **Privacy Policy** URL in the [Discord Developer Portal](https://discord.com/developers/applications) to this file (e.g. the raw GitHub URL of `Server/PRIVACY.md`).

## License

MIT
