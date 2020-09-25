import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";

export async function connectToChimeMeeting(meeting, attendee) {
  let logger = new ConsoleLogger("SDK", LogLevel.INFO);
  const deviceController = new DefaultDeviceController(logger);
  const configuration = new MeetingSessionConfiguration(meeting, attendee);
  const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  meetingSession.audioVideo.setDeviceLabelTrigger(stream);
  return meetingSession;
}

export async function initializeDevices(meetingSession, audioOutputElement) {
  meetingSession.audioVideo.setDeviceLabelTrigger(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    return stream;
  });
  await setMeetingAudioInputDevice(meetingSession);
  await setMeetingAudioOutputDevice(meetingSession);
  bindMeetingAudioOutput(meetingSession, audioOutputElement);
  const observer = {
    audioVideoDidStart: () => {
      console.log("Started");
    },
    audioVideoDidStop: (sessionStatus) => {
      console.log("Stopped with a session status code: ", sessionStatus.statusCode());
    },
    audioVideoDidStartConnecting: (reconnecting) => {
      if (reconnecting) {
        console.log("Attempting to reconnect");
      }
    },
  };
  meetingSession.audioVideo.addObserver(observer);
  meetingSession.audioVideo.start();
}

// ----------------------------------------------------------------------------
// AUDIO HANDLERS
// ----------------------------------------------------------------------------

export async function setMeetingAudioInputDevice(meetingSession) {
  try {
    const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInputs[0].deviceId);
  } catch (err) {
    console.log(err);
  }
}

export async function setMeetingAudioOutputDevice(meetingSession) {
  try {
    const audioOutputs = await meetingSession.audioVideo.listAudioOutputDevices();
    await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputs[0].deviceId);
  } catch (err) {
    console.log(err);
  }
}

export function bindMeetingAudioOutput(meetingSession, audioOutputElement) {
  meetingSession.audioVideo.bindAudioElement(audioOutputElement);
}

export async function setMeetingVideoInputDevice(meetingSession) {
  try {
    const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();
    await meetingSession.audioVideo.chooseVideoInputDevice(videoInputs[0].deviceId);
  } catch (err) {
    console.log(err);
  }
}

// ----------------------------------------------------------------------------
// VIDEO HANDLERS
// ----------------------------------------------------------------------------

export async function startVideo(meetingSession, videoElement) {
  await setMeetingVideoInputDevice(meetingSession);
  const observer = {
    videoTileDidUpdate: (tileState) => {
      if (!tileState.boundAttendeeId || !tileState.localTile) {
        return;
      }
      meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
    },
  };
  meetingSession.audioVideo.addObserver(observer);
  meetingSession.audioVideo.startLocalVideoTile();
}

export async function stopVideo(meetingSession, videoElement) {
  let localTileId = null;
  const observer = {
    videoTileDidUpdate: (tileState) => {
      if (!tileState.boundAttendeeId || !tileState.localTile) {
        return;
      }
      console.log(`If you called stopLocalVideoTile, ${tileState.active} is false.`);
      meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
      localTileId = tileState.tileId;
    },
    videoTileWasRemoved: (tileId) => {
      if (localTileId === tileId) {
        console.log(`You called removeLocalVideoTile. videoElement can be bound to another tile.`);
        localTileId = null;
      }
    },
  };
  meetingSession.audioVideo.addObserver(observer);
  meetingSession.audioVideo.stopLocalVideoTile();
}

export async function watchVideo(meetingSession, videoElement) {
 const observer = {
   videoTileDidUpdate: (tileState) => {
     if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
       return;
     }
     meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
   },
 };
 meetingSession.audioVideo.addObserver(observer);
}
