/**
 * One-time script to register slash commands.
 * Run: node scripts/register-commands.js
 * Requires: DISCORD_TOKEN and DISCORD_APPLICATION_ID in .env
 */
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from '../src/commands/index.js';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  console.error('Set DISCORD_TOKEN and DISCORD_APPLICATION_ID in .env');
  process.exit(1);
}

const rest = new REST().setToken(token);
try {
  await rest.put(Routes.applicationCommands(applicationId), { body: commands });
  console.log('Successfully registered slash commands.');
} catch (e) {
  console.error(e);
  process.exit(1);
}
