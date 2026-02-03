# RaiseHand

A **Discord** setup for orderly speaking: a bot manages a raise-your-hand queue, and an optional client plugin shows a hand (and your queue number) on your video so everyone can see who’s next.

Great for **D&D**, **game nights**, **meetings**, and any voice/video call where you want a clear “who has the floor” without talking over each other.

---

## What’s in this repo

| Part | What it is |
|------|------------|
| **Server** | A Discord bot that runs the queue: `/queue`, `/lower`, `/next`, `/queuelist`, `/clear`. Each channel has its own queue, and visible queue numbers are capped at **99**. |
| **Client** | A **BetterDiscord** plugin that shows a hand icon (and your queue number, capped at **99**) on your video when you’re in the queue — both on your preview and (when possible) in the stream others see. |

- **Bot only:** Install and run the **Server** bot; everyone can use the slash commands. No plugin required.
- **Full experience:** Install the **Server** bot *and* the **Client** plugin; then when you `/queue`, the hand appears on your video for you and others.

---

## Why it’s useful (e.g. D&D)

- **D&D sessions:** Players `/queue` when they want to speak or act; the DM uses `/next` to call on someone. The hand on video makes it obvious who’s up and who’s waiting, so the table stays organized even over voice/video.
- **Game nights / watch parties:** One shared queue so people take turns without crosstalk.
- **Meetings / study groups:** Same idea — raise hand, get called, lower hand when done.

The bot keeps the order; the plugin (optional) makes that order visible on camera.

---

## Quick start

1. **Bot (required)**  
   See **[Server/README.md](Server/README.md)** for:
   - Creating a Discord application and bot
   - Installing dependencies and configuring `.env`
   - Running the bot and using `/queue`, `/lower`, `/next`, `/queuelist`, `/clear`

2. **Plugin (optional)**  
   See **[Client/README.md](Client/README.md)** for:
   - Installing the BetterDiscord plugin
   - Using `/queue` and `/lower` so the hand shows or hides on your video

---

## License

Use and modify as you like. Server is MIT.
