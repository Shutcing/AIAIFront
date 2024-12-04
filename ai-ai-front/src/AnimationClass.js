class State {
  constructor(initial) {
    this.start = initial;
    this.end = null;
  }
}

class Time {
  constructor(initial) {
    this.start = initial;
    this.end = null;
  }
}

export class Animation {
  constructor(type, title, initialState, initialTime) {
    this.type = type;
    this.states = new State(initialState);
    this.time = new Time(initialTime);
    this.title = title;
  }

  setEndState(state) {
    this.states.end = state;
  }

  setEndTime(time) {
    this.time.end = time;
  }
}
