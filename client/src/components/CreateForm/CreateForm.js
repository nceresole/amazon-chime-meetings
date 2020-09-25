import React, { Component } from "react";
import { AsyncScheduler } from "amazon-chime-sdk-js";
import { connectToChimeMeeting } from "../../utils/chime";
import Input from "../Input/Input";

class CreateForm extends Component {
  state = {
    form: {
      room: "",
      user: "",
    },
    errors: {},
  };

  validate = () => {
    const errors = {};
    const { form } = this.state;
    if (form.room.trim() === "") errors.room = "Room name is required.";
    if (form.user.trim() === "") errors.user = "User name is required.";
    return Object.keys(errors).length === 0 ? null : errors;
  };

  handleInputChange = ({ currentTarget: input }) => {
    const form = { ...this.state.form };
    form[input.name] = input.value;
    this.setState({ form });
  };

  async joinMeeting() {
    const { form } = this.state;
    const response = await fetch("/join", {
      method: "post",
      body: JSON.stringify({ form }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(`Server error: ${data.error}`);
    }
    const meeting = JSON.parse(data);
    let session = await connectToChimeMeeting(meeting.meeting, meeting.attendee);
    return { meeting, session };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;
    new AsyncScheduler().start(async () => {
      try {
        let response = await this.joinMeeting();
        this.props.handleStartMeeting(response.meeting, response.session);
      } catch (error) {
        console.log("Error: ", error);
        return;
      }
    });
  };

  render() {
    const { form, errors } = this.state;
    return (
      <form onSubmit={this.handleSubmit} style={{ margin: "0 auto", width: "300px" }}>
        <Input name="room" value={form.room} label="Room" error={errors.room} onChange={this.handleInputChange} />
        <Input name="user" value={form.user} label="User" error={errors.user} onChange={this.handleInputChange} />
        <button type="submit" className="btn btn-primary">
          Create Meeting
        </button>
      </form>
    );
  }
}

export default CreateForm;
