const ROOM_ID_KEY = "peerix-roomId";

function generateRoomId(): string {
  const segment = () => Math.random().toString(36).slice(2, 5);
  return `${segment()}-${segment()}-${segment()}`;
}

function getRoomId(): string {
  const fromHash = location.hash.slice(1);
  if (fromHash) return fromHash;

  const id = generateRoomId();
  try {
    localStorage.setItem(ROOM_ID_KEY, id);
  } catch {
    // storage unavailable
  }
  location.hash = `#${id}`;
  return id;
}

export const roomId = getRoomId();
export const inviteLink = `${location.origin}${location.pathname}#${roomId}`;
