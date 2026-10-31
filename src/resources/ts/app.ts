/**
 * App Entry Point
 *
 * This is the main TypeScript entry point for your application.
 * Vite bundles everything imported here into a single output
 * file with Tailwind CSS included.
 *
 * Add your own imports, event listeners, and custom scripts
 * below the framework imports.
 */

import "../css/app.css";
import "@glimr/loom";

const chatForm = document.querySelector<HTMLFormElement>("#chat-form");
const chatInput = document.querySelector<HTMLTextAreaElement>("#chat-input");
const chatLog = document.querySelector<HTMLElement>("#chat-log");

if (chatForm && chatInput && chatLog) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = text;
    chatLog.append(message);
    chatLog.scrollTop = chatLog.scrollHeight;

    chatInput.value = "";
    chatInput.focus();
  });

  // Enter sends, Shift+Enter adds a new line.
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });
}
