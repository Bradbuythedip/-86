import { sendSol, getBalance } from "./solana.js";

const ACTION_REGEX = /\[ACTION:(BUY|SEND|PRICE)\s+(.+?)\]/;

export function parseAction(text) {
  const match = text.match(ACTION_REGEX);
  if (!match) return null;

  const [, type, args] = match;
  const parts = args.trim().split(/\s+/);

  switch (type) {
    case "BUY":
      return { type: "BUY", token: parts[0], amount: parts[1] || "0.1" };
    case "SEND":
      return {
        type: "SEND",
        token: parts[0],
        amount: parts[1],
        recipient: parts[2],
      };
    case "PRICE":
      return { type: "PRICE", token: parts[0] };
    default:
      return null;
  }
}

export function stripAction(text) {
  return text.replace(ACTION_REGEX, "").trim();
}

export async function executeAction(action) {
  switch (action.type) {
    case "BUY":
      // TODO: Integrate with PumpPortal / Jupiter / Bondli API
      console.log(
        `[ACTION] Would buy ${action.amount} SOL of ${action.token}`
      );
      return {
        success: true,
        message: `buy order for ${action.token} queued. leek brain activated.`,
      };

    case "SEND":
      if (action.token.toUpperCase() === "SOL" && action.recipient) {
        const balance = await getBalance();
        const amount = parseFloat(action.amount);
        if (amount > balance) {
          return {
            success: false,
            message: "not enough sol. leek is poor. 完了",
          };
        }
        const sig = await sendSol(action.recipient, amount);
        return { success: true, message: `sent. tx: ${sig}` };
      }
      // TODO: SPL token transfers
      return {
        success: true,
        message: `send ${action.amount} ${action.token} queued.`,
      };

    case "PRICE":
      // TODO: Integrate with DexScreener / Jupiter price API
      console.log(`[ACTION] Would check price of ${action.token}`);
      return {
        success: true,
        message: `checking ${action.token} price... number exist. whether good number is different question.`,
      };

    default:
      return { success: false, message: "leek brain cannot process this" };
  }
}
