function generateRoomId(): string {
  const segment = () => Math.random().toString(36).slice(2, 5);
  const id = `${segment()}-${segment()}-${segment()}`;
  location.hash = `#${id}`;
  return id;
}

export const roomId = location.hash.slice(1) || generateRoomId();
export const inviteLink = `${location.origin}${location.pathname}#${roomId}`;
