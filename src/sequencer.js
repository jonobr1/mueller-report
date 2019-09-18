(function(root) {

  var _ = Two.Utils;

  root.Sequencer = Sequencer;

  function Segment() {

    this.startTime = null;
    this.endTime = null;
    this.duration = 0;
    this.index = 0;
    this.iteration = 1;
    this.recording = false;

    this.events = [];

  }

  _.extend(Segment.prototype, {

    constructor: Segment,

    start: function() {
      this.startTime = Two.Utils.performance.now();
      this.recording = true;
      return this;
    },

    stop: function() {
      this.endTime = Two.Utils.performance.now();
      this.duration = this.endTime - this.startTime;
      this.recording = false;
      return this;
    },

    /**
     * Each event should consist of:
     * {
     *   time: [Date],
     *   data: [Object]
     * }
     */
    add: function(name, e) {
      var now = Two.Utils.performance.now();
      this.events.push({
        time: now - this.startTime,
        name: name,
        data: e
      });
      return this;
    }

  })

  function Sequencer() {

    this.recording = false;
    this.segments = [];

  }

  _.extend(Sequencer.prototype, Two.Utils.Events, {

    constructor: Sequencer,

    getCurrent() {
      return this.segments[this.segments.length - 1];
    },

    getRecording() {
      return this.recording;
    },

    setRecording(v) {

      var emptySegment = this.segments.length > 0
        && this.segments[this.segments.length - 1].events.length <= 0;

      if (!!v && !this.recording) {
        this.segments.push(new Segment().start());
      } else if (!v && this.recording) {
        if (emptySegment) {
           // Remove the latest recording if nothing was recorded
          this.clear();
        } else {
          // Stop recording of last element
          this.segments[this.segments.length - 1].stop();
        }
      }

      this.recording = !!v;

    },

    /**
     * To be fun on requestAnimationFrame
     */
    update: function() {

      var now = Two.Utils.performance.now();

      for (var i = 0; i < this.segments.length; i++) {

        var segment = this.segments[i];

        if (segment.recording) {
          continue;
        }

        var elapsed = now - segment.startTime;
        var iteration = Math.floor(elapsed / segment.duration);
        var time = elapsed % segment.duration;
        var j = segment.index;
        var event = segment.events[j];

        if (iteration === segment.iteration && event.time <= time) {
          this.trigger(event.name, event.data);
          segment.index++;
          if (segment.index >= segment.events.length) {
            segment.index = 0;
            segment.iteration++;
          }
        }

      }

      return this;

    },

    clear: function() {

      if (this.segments.length > 0) {
        this.segments.pop();
      }
      return this;

    },

    clearAll: function() {

      this.segments.length = 0;
      return this;

    }

  });

})(window);
