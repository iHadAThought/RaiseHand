# RaiseHand Bot — Privacy & Data

RaiseHand is designed to comply with [Discord’s Terms of Service](https://discord.com/terms) and [Discord Developer Policy](https://dis.gd/discord-developer-policy).

## What data the bot uses

- **When you use commands:** The bot receives your **user ID**, **server (guild) ID**, and **channel ID** from Discord, plus **display names** when showing the queue (e.g. `/queuelist`, `/next`). This is the minimum needed to run the queue (who is in which channel’s queue and in what order).

- **Where it’s kept:** Queue state (channel → list of user IDs and order) is held **only in the bot’s memory** while it is running. Nothing is written to disk or sent to any other service. Restarting the bot clears all queues.

- **No logging of messages:** The bot does not read or store message content. It uses **slash commands only** and does not request or use the Message Content intent.

## What we don’t do

- We do **not** collect, store, or transmit your password, email, or any login credentials.
- We do **not** sell, license, or share API or user data with third parties, advertisers, or data brokers.
- We do **not** use data to profile users or for advertising.
- We do **not** scrape or mine Discord, and we do **not** use message content for ML/AI training.

## Your choices

- **Remove the bot:** Server admins can remove the bot from their server at any time. After removal, the bot no longer has access to that server.
- **Opt out:** Don’t use `/queue`, `/raise`, `/lower`, or other commands if you don’t want your user ID and display name to be used in queue lists in that channel.

## Reporting issues

If you see the bot or its use violating Discord’s rules or this policy, you can:

- Open an issue in this repository, or  
- Report the app to [Discord](https://support.discord.com/hc/en-us/requests/new).

## Changes

We may update this page to reflect changes in the bot or Discord’s policies. The latest version is always in the repository linked from the bot’s listing or invite.
