(function(root) {

  var _ = Two.Utils;

  // Export
  root.PageReader = PageReader;

  function PageReader(src) {

    var scope = this;

    this.src = src;
    this.index = 0;

    var request = new XMLHttpRequest();
    request.addEventListener('load', onLoad, false);
    request.open('GET', src);
    request.send();

    function onLoad(e) {

      scope.raw = request.response;
      scope.data = JSON.parse(request.response);
      scope.loaded = true;

      scope.trigger('load');

    }

  }

  _.extend(PageReader.prototype, Two.Utils.Events, {

    constructor: PageReader,

    next: function() {

      if (!this.loaded) {
        console.warn('PageReader.js: Unable to go to page',
          this.index, 'because a document hasn\'t been loaded.');
      }

      var page = this.data.pages[this.index];
      var words = page.split(/\s/);
      this.index = (this.index + 1) % this.data.pages.length;

      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (!word || /\s/i.test(word)) {
          words.splice(i, 1);
        } else if (/\■/i.test(word)) {
          words[i] = { value: 'redacted', length: word.length };
        }
      }

      if (words.length <= 0) {
        return this.next();
      }

      return words;

    }

  });

})(window);
