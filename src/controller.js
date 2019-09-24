(function(root) {

  var _ = Two.Utils;

  // Export
  root.Controller = Controller;

  /**
   * @class
   * @description
   * Visualize all the attributes of the Seabord
   * in order to understand what each feature does:
   * 1. channel: 5 — Dunno what this is ...
   * 2. noteNumber: 12
   *    (zero indexed on number of keys — out of 24 keys on my Seabord)
   * 3. noteOnVelocity: 1
   *    (from zero to one forinitial velocity when tapping the keyboard)
   * 4. pitchBend: 0
   *    (-1, 1 ~ ish ~ Left-to-right movement of finger when pressing on key)
   * 5. pressure: 0
   *    (from zero to one where one is the max pressure)
   * 6. timbre: 0.5
   *    (0.5, 1 white keys, 0.5, 0.75 short keys ~ Up-and-down movement of finger when pressing on key)
   */
  function Controller() {

    var scope = this;
    var instrument = mpe();
    var notes = {};

    scope._private = {
      pressure: 0
    };

    instrument.subscribe(function(e) {

      var index, note;

      if (e.length > 0) {

        scope._private.pressure = 0;

        for (i = 0; i < e.length; i++) {

          var note = e[i];
          var index = note.noteNumber;

          if (notes[index]) {
            scope.trigger('update', note);
          } else {
            scope.trigger('down', note);
          }

          notes[index] = note;
          scope._private.pressure += note.pressure;

        }

        scope._private.pressure /= e.length;

      } else {

        scope._private.pressure = 0;

      }

      for (index in notes) {

        note = notes[index];
        if (note.noteState <= 0) {
          scope.trigger('up', note);
          delete notes[index];
          if (_.isEmpty(notes)) {
            scope.trigger('blur');
          }
        }

      }

    });

    navigator.requestMIDIAccess().then(function(access) {
      access.inputs.forEach(function(midiInput) {
        midiInput.addEventListener('midimessage',function(e) {
          instrument.processMidiMessage(e.data);
        });
      });
    });

  }

  _.extend(Controller.prototype, Two.Utils.Events, {

    constructor: Controller

  });

  /**
   * The global pressure from all keys pressed of the controller.
   */
  Object.defineProperty(Controller.prototype, 'pressure', {

    enumerable: true,

    get: function() {
      return this._private.pressure;
    }

  });

})(window);
