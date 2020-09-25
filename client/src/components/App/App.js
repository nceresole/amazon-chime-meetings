import React, { Component, Fragment } from "react";
import CreateForm from "../CreateForm/CreateForm";
import MeetingControls from "../MeetingControls/MeetingControls";
import { initializeDevices, startVideo, stopVideo, watchVideo } from "../../utils/chime";
import { isEmptyObject } from "../../utils/utils";
import "./App.css";

class App extends Component {
  state = {
    meetingData: {},
    meetingSession: {},
    sharingVideo: false,
  };

  handleStartMeeting = (meetingData, meetingSession) => {
    this.setState({ meetingData, meetingSession });
    const audioElement = document.getElementById("my-audio-element");
    initializeDevices(meetingSession, audioElement);
  };

  handleEndMeeting = () => {
    this.setState({ meetingData: {}, meetingSession: {} });
  };

  handleStartVideo = async () => {
    const videoElement = document.getElementById("my-video-element");
    startVideo(this.state.meetingSession, videoElement);
    this.setState({ sharingVideo: true });
  };

  handleStopVideo = async () => {
    const videoElement = document.getElementById("my-video-element");
    stopVideo(this.state.meetingSession, videoElement);
    this.setState({ sharingVideo: false });
  };

  handleWatchVideo = async () => {
    const videoElement = document.getElementById("attendee-video-element");
    watchVideo(this.state.meetingSession, videoElement);
  };

  render() {
    const { meetingData, sharingVideo } = this.state;
    return (
      <div className="App">
        <h1 className="mt-4">Conference PoC</h1>
        {isEmptyObject(meetingData) ? (
          <CreateForm handleStartMeeting={this.handleStartMeeting} />
        ) : (
          <Fragment>
            <MeetingControls
              meetingData={meetingData}
              handleEndMeeting={this.handleEndMeeting}
              handleStartVideo={this.handleStartVideo}
              handleStopVideo={this.handleStopVideo}
              sharingVideo={sharingVideo}
              handleWatchVideo={this.handleWatchVideo}
            />
            <div className="meeting-room">
              <audio id="my-audio-element" style={{ display: "none" }}></audio>
              <video id="my-video-element"></video>
              <video id="attendee-video-element"></video>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

export default App;
