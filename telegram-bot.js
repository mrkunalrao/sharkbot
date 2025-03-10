const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_IDS = process.env.ADMIN_CHAT_IDS.split(",").map(id => id.trim()); // Convert to array
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_URL = process.env.API_URL;
const SECRET_KEY = process.env.SECRET_KEY;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function isAdmin(chatId) {
  return ADMIN_CHAT_IDS.includes(chatId.toString());
}

bot.onText(/\/activate (\S+) (\S+)/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const machineId = match[1];
  const soft = match[2];

  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, "❌ Unauthorized! You do not have permission.");
    return;
  }

  try {
    const response = await axios.post(`${API_URL}`, {
      machineId,
      soft,
      secretKey: SECRET_KEY,
    });

    const successMessage = `✅ *Activated Machine ID:* \`${machineId}\`\n📦 *Software:* \`${soft}\``;
    
    bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
    bot.sendMessage(CHANNEL_ID, successMessage, { parse_mode: "Markdown" });

  } catch (error) {
    bot.sendMessage(chatId, "❌ Activation failed. Error: " + (error.response?.data?.error || error.message));
  }
});

bot.onText(/\/deactivate (\S+) (\S+)/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const machineId = match[1];
  const soft = match[2];

  if (!isAdmin(chatId)) {
    bot.sendMessage(chatId, "❌ Unauthorized! You do not have permission.");
    return;
  }

  try {
    const response = await axios.post(`${API_URL.replace("activate", "deactivate")}`, {
      machineId,
      soft,
      secretKey: SECRET_KEY,
    });

    const successMessage = `❌ *Deactivated Machine ID:* \`${machineId}\`\n📦 *Software:* \`${soft}\``;
    
    bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
    bot.sendMessage(CHANNEL_ID, successMessage, { parse_mode: "Markdown" });

  } catch (error) {
    bot.sendMessage(chatId, "❌ Deactivation failed. Error: " + (error.response?.data?.error || error.message));
  }
});

console.log("🚀 Telegram bot is running...");
