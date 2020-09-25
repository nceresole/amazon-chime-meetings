const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const meetingTable = {};
const chime = new AWS.Chime({ region: "us-east-1" });
chime.endpoint = new AWS.Endpoint("https://service.chime.aws.amazon.com");

app.post("/join", async (req, res) => {
  const { form } = req.body;
  if (!meetingTable["form.room"]) {
    meetingTable["form.room"] = await chime
      .createMeeting({
        ClientRequestToken: uuidv4(),
        MediaRegion: "us-east-1",
        ExternalMeetingId: "form.room".substring(0, 64),
      })
      .promise();
  }
  const meeting = meetingTable["form.room"];
  const attendee = await chime
    .createAttendee({
      MeetingId: meeting.Meeting.MeetingId,
      ExternalUserId: `${uuidv4().substring(0, 8)}#${form.user}`.substring(0, 64),
    })
    .promise();
  res.json(JSON.stringify({ meeting: meeting.Meeting, attendee: attendee.Attendee }, null, 2));
});

app.post("/end", async (req, res) => {
  await chime.deleteMeeting({ MeetingId: meetingTable[req.body.meetingName].Meeting.MeetingId }).promise();
  res.json({});
});

app.listen(5000, () => console.log("Server started on port 5000"));
