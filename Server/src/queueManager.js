/**
 * Manages the raise-hands speaking queue per channel.
 * Each channel (e.g., a D&D voice/session channel) has its own queue.
 */
class QueueManager {
  constructor() {
    /** @type {Map<string, string[]>} channelId -> array of user ids (order preserved) */
    this.queues = new Map();
  }

  /**
   * Get or create queue for a channel
   * @param {string} channelId 
   * @returns {string[]}
   */
  getQueue(channelId) {
    if (!this.queues.has(channelId)) {
      this.queues.set(channelId, []);
    }
    return this.queues.get(channelId);
  }

  /**
   * Add user to queue if not already in it
   * @param {string} channelId 
   * @param {string} userId 
   * @returns {{ added: boolean, position: number }}
   */
  raiseHand(channelId, userId) {
    const queue = this.getQueue(channelId);
    if (queue.includes(userId)) {
      return { added: false, position: queue.indexOf(userId) + 1 };
    }
    queue.push(userId);
    return { added: true, position: queue.length };
  }

  /**
   * Remove user from queue
   * @param {string} channelId 
   * @param {string} userId 
   * @returns {boolean}
   */
  lowerHand(channelId, userId) {
    const queue = this.getQueue(channelId);
    const idx = queue.indexOf(userId);
    if (idx === -1) return false;
    queue.splice(idx, 1);
    return true;
  }

  /**
   * Get and remove the next person in queue
   * @param {string} channelId 
   * @returns {string | null} userId or null if queue empty
   */
  callNext(channelId) {
    const queue = this.getQueue(channelId);
    if (queue.length === 0) return null;
    return queue.shift();
  }

  /**
   * Clear the entire queue for a channel
   * @param {string} channelId 
   */
  clear(channelId) {
    this.queues.set(channelId, []);
  }

  /**
   * Get queue as array of user ids (read-only copy)
   * @param {string} channelId 
   * @returns {string[]}
   */
  getOrderedUsers(channelId) {
    return [...this.getQueue(channelId)];
  }
}

export const queueManager = new QueueManager();
