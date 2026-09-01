// generated-by-copilot: sanitize log messages to prevent log injection
function sanitizeLogMessage(str) {
  return String(str).replace(/[\r\n]/g, ' ');
}

module.exports = {
  sanitizeLogMessage,
};
