function generateRoomId(): string {
  const segment = () => Math.random().toString(36).slice(2, 5);
  return `${segment()}-${segment()}-${segment()}`;
}

const roomId = location.hash.slice(1) || generateRoomId();
if (!location.hash) location.hash = roomId;

export function getRoomId() {
  return {
    roomId,
    inviteLink: `${location.origin}${location.pathname}#${roomId}`,
  };
}
