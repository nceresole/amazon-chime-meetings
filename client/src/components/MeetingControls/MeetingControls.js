import React, { Fragment } from "react";

const MeetingControls = ({
  meetingData,
  handleEndMeeting,
  handleStartVideo,
  handleStopVideo,
  sharingVideo,
  handleWatchVideo,
}) => {
  const endMeeting = () => {
    const meetingName = meetingData.meeting.ExternalMeetingId;
    fetch("/end", {
      method: "post",
      body: JSON.stringify({ meetingName }),
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    }).then(() => handleEndMeeting());
  };

  return (
    <Fragment>
      {!sharingVideo ? (
        <button onClick={handleStartVideo} className="btn btn-primary">
          Start Video
        </button>
      ) : (
        <button onClick={handleStopVideo} className="btn btn-primary">
          Stop Video
        </button>
      )}
      <button onClick={handleWatchVideo} className="btn btn-secondary mx-4">
        Watch Video
      </button>
      <button onClick={endMeeting} className="btn btn-danger">
        End Meeting
      </button>
    </Fragment>
  );
};

export default MeetingControls;
