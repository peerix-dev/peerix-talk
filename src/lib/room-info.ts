function generateRoomId(): string {
  const segment = () => Math.random().toString(36).slice(2, 5);
  return `${segment()}-${segment()}-${segment()}`;
}

function getRoomId(): string {
  const fromHash = location.hash.slice(1);
  if (fromHash) return fromHash;

  const id = generateRoomId();
  location.hash = `#${id}`;
  return id;
}

export const roomId = getRoomId();
export const inviteLink = `${location.origin}${location.pathname}#${roomId}`;

// Reload the page when the hash changes (e.g. user navigates to a different room).
window.addEventListener("hashchange", () => location.reload());
