import { SlashCommandBuilder, MessageFlags, ChannelType } from 'discord.js';
import { queueManager } from '../queueManager.js';

const MAX_POSITION = 99;
function displayPosition(position) {
  return Math.min(position, MAX_POSITION);
}

/** Magic suffix for RaiseHand plugin — plugin looks for these in ephemeral reply text. Include position for overlay (capped at 99). */
function markerShow(position) {
  return `\u200BRaiseHand:SHOW:${displayPosition(position)}`;
}
const MARKER_LOWER = "\u200BRaiseHand:LOWER";
/** Build position-update marker so plugin can update numbers when /next is used (position:userId pairs). Empty queue = POS: so plugin can hide hand for the person who was called. */
function markerPositions(userIds) {
  const parts = userIds.length ? userIds.map((id, i) => `${displayPosition(i + 1)}:${id}`).join(":") : "";
  return `\u200BRaiseHand:POS:${parts}`;
}

/** Format user for display in queue */
function formatQueueLine(index, member) {
  return `${displayPosition(index)}. ✋ ${member}`;
}

/** Command channel ID -> { messageId, channelId } (channelId = where we actually sent, so we can edit) */
const stateMessageByChannel = new Map();

/** Build human-readable queue line for the notification. */
function formatQueueNotify(members, displayPos) {
  return members
    .filter(Boolean)
    .map((m, i) => `**${m.displayName}** (${displayPos(i + 1)})`)
    .join(', ');
}

/** Text channel to post to: use command channel if it's text-based, else first viewable text channel in the guild. */
function getTextChannelForBroadcast(interaction) {
  const channel = interaction.channel;
  if (!channel || !interaction.guild) return null;
  if (channel.isTextBased && channel.isTextBased()) return channel;
  if (channel.type === ChannelType.GuildVoice) {
    const text = interaction.guild.channels.cache.find(
      (c) => (c.isTextBased && c.isTextBased()) && c.viewable
    );
    return text || null;
  }
  return channel;
}

/** Send or edit a public message: notifies everyone who has their hand raised, and appends the POS marker so all plugins can draw the hand on the raiser's video. */
async function broadcastQueueState(interaction) {
  const targetChannel = getTextChannelForBroadcast(interaction);
  if (!targetChannel) return;
  const channelId = interaction.channelId;
  const userIds = queueManager.getOrderedUsers(channelId);
  const posMarker = markerPositions(userIds);

  let humanText;
  if (userIds.length === 0) {
    humanText = '✋ No one has their hand raised.';
  } else {
    const members = await Promise.all(
      userIds.map((id) => interaction.guild.members.fetch(id).catch(() => null))
    );
    const names = formatQueueNotify(members, displayPosition);
    humanText = userIds.length === 1
      ? `✋ ${names} raised their hand.`
      : `✋ ${names} have their hand raised.`;
  }
  const content = `${humanText}${posMarker}`;

  const data = stateMessageByChannel.get(channelId);
  if (data) {
    try {
      const ch = data.channelId ? interaction.guild.channels.cache.get(data.channelId) : targetChannel;
      const msg = ch ? await ch.messages.fetch(data.messageId) : null;
      if (msg) {
        await msg.edit(content);
        return;
      }
    } catch (_) {}
    stateMessageByChannel.delete(channelId);
  }
  try {
    const sent = await targetChannel.send(content);
    stateMessageByChannel.set(channelId, { messageId: sent.id, channelId: targetChannel.id });
  } catch (_) {}
}

export const commands = [
  new SlashCommandBuilder()
    .setName('raise')
    .setDescription('Raise your hand — add yourself to the speaking queue')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('lower')
    .setDescription('Lower your hand — remove yourself from the speaking queue')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Raise your hand — add yourself to the queue (shows hand on your video)')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('queuelist')
    .setDescription('Show who has their hand raised (speaking order)')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('next')
    .setDescription('Call on the next person in the queue (DM or session host)')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear the speaking queue (DM or session host)')
    .toJSON(),
];

export async function handleCommand(interaction) {
  const { commandName } = interaction;
  const channelId = interaction.channelId;
  const userId = interaction.user.id;

  if (commandName === 'raise') {
    const { added, position } = queueManager.raiseHand(channelId, userId);
    const visiblePos = displayPosition(position);
    if (added) {
      await interaction.reply({
        content: `✋ You're in the speaking queue (position **${visiblePos}**). Use \`/queuelist\` to see the order.${markerShow(visiblePos)}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `You're already in the queue at position **${visiblePos}**. Use \`/lower\` if you want to remove yourself.${markerShow(visiblePos)}`,
        flags: MessageFlags.Ephemeral,
      });
    }
    await broadcastQueueState(interaction);
    return;
  }

  if (commandName === 'lower') {
    const removed = queueManager.lowerHand(channelId, userId);
    if (removed) {
      await interaction.reply({
        content: `👍 Hand lowered. You've been removed from the speaking queue.${MARKER_LOWER}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "You're not in the speaking queue.",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (removed) await broadcastQueueState(interaction);
    return;
  }

  if (commandName === 'queue') {
    const { added, position } = queueManager.raiseHand(channelId, userId);
    const visiblePos = displayPosition(position);
    const positionText = added
      ? `You're in the speaking queue (position **${visiblePos}**).`
      : `You're already in the queue at position **${visiblePos}**.`;
    await interaction.reply({
      content: `✋ Hand raised. ${positionText} Use \`/queuelist\` to see the order.${markerShow(visiblePos)}`,
      flags: MessageFlags.Ephemeral,
    });
    await broadcastQueueState(interaction);
    return;
  }

  if (commandName === 'queuelist') {
    const userIds = queueManager.getOrderedUsers(channelId);
    if (userIds.length === 0) {
      await interaction.reply({
        content: '📭 **Speaking Queue** — No hands raised. Use `/queue` to add yourself!',
      });
      return;
    }

    const members = await Promise.all(
      userIds.map((id) =>
        interaction.guild.members.fetch(id).catch(() => null)
      )
    );
    const lines = members
      .filter(Boolean)
      .map((m, i) => formatQueueLine(i + 1, m.displayName));
    const text = lines.join('\n');

    await interaction.reply({
      content: `📋 **Speaking Queue** (use \`/next\` to call on someone)\n\n${text}`,
    });
    return;
  }

  if (commandName === 'next') {
    const nextUserId = queueManager.callNext(channelId);
    if (!nextUserId) {
      await interaction.reply({
        content: '📭 The queue is empty. No one has their hand raised.',
      });
      return;
    }

    const member = await interaction.guild.members.fetch(nextUserId).catch(() => null);
    const name = member ? member.displayName : '<unknown>';
    const remainingIds = queueManager.getOrderedUsers(channelId);
    const posMarker = markerPositions(remainingIds);
    await interaction.reply({
      content: `🎤 **Your turn, ${name}!** (removed from queue)${posMarker}`,
    });
    await broadcastQueueState(interaction);
    return;
  }

  if (commandName === 'clear') {
    queueManager.clear(channelId);
    await interaction.reply({
      content: '🧹 Speaking queue cleared.',
    });
    await broadcastQueueState(interaction);
    return;
  }
}
