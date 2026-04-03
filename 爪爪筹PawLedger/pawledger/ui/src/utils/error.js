function trimRevertPrefix(message) {
  if (!message) return "";
  return message
    .replace(/^execution reverted:\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .trim();
}

function isUserRejected(error) {
  const code = error?.code ?? error?.info?.error?.code;
  return code === 4001 || code === "ACTION_REJECTED";
}

export function getReadableError(error, t, fallbackKey = "common.error") {
  if (!error) return t(fallbackKey);

  if (isUserRejected(error)) {
    return t("adoption.error.wallet_rejected");
  }

  const raw =
    error?.reason ||
    error?.shortMessage ||
    error?.info?.error?.message ||
    error?.data?.message ||
    error?.message ||
    "";

  if (raw.includes("WEB_CRYPTO_UNAVAILABLE")) {
    return t("adoption.error.crypto_unavailable");
  }

  const cleaned = trimRevertPrefix(raw);
  if (cleaned) return cleaned;

  return t(fallbackKey);
}