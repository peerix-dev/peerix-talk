export async function getUserMedia(options: {
  audio: boolean;
  video: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}): Promise<MediaStream> {
  const { audio, video, audioDeviceId, videoDeviceId } = options;
  return navigator.mediaDevices.getUserMedia({
    audio: audio ? (audioDeviceId ? { deviceId: audioDeviceId } : true) : false,
    video: video ? (videoDeviceId ? { deviceId: videoDeviceId } : true) : false,
  });
}

export async function getDisplayMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true,
  });
}
