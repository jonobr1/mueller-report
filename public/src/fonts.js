(function(root) {

  var _ = Two.Utils

  root.Fonts = Fonts;

  function Fonts(names) {

    this.families = [];

    for (var i = 0; i < names.length; i++) {

      var name = names[i].value;
      var url = names[i].url;
      var font = new FontFace(name, 'url(' + url + ')');

      this.families.push(font);
      document.fonts.add(font);

      font.load();

    }

  }

  _.extend(Fonts.prototype, Two.Utils.Events, {

    constructor: Fonts

  });

})(window);
