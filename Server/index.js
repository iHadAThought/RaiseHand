import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  MessageFlags,
} from 'discord.js';
import { commands, handleCommand } from './src/commands/index.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN. Copy .env.example to .env and add your bot token.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  await registerCommands(c);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    await handleCommand(interaction);
  } catch (err) {
    console.error('Command error:', err);
    const reply = {
      content: 'Something went wrong while running that command.',
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

// Register slash commands on startup
async function registerCommands(c) {
  const applicationId = process.env.DISCORD_APPLICATION_ID || c.user.id;
  const rest = new REST().setToken(token);
  try {
    await rest.put(Routes.applicationCommands(applicationId), {
      body: commands,
    });
    console.log('Slash commands registered.');
  } catch (e) {
    console.error('Failed to register commands:', e);
  }
}

client.login(token);
