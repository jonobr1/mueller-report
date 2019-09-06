var fs = require('fs');
var path = require('path');
var _ = require('underscore');

fs.readFile(path.resolve(__dirname, process.argv[2]), function(err, resp) {

  if (err) {
    console.log(err);
    return;
  }

  template(JSON.parse(resp));

});

var head = `
<!doctype html>
<html>
  <head>

    <meta charset="utf-8">
    <title>Word Occurrences in the Mueller Report</title>
    <link rel="stylesheet" type="text/css" href="./styles/main.css">
    <link rel="icon" type="image/png" href="./images/eyes_1f440.png">

    <meta name="name" content="Word Occurrences in the Mueller Report">
    <meta name="description" content="This is a list of unique words that show up in the Mueller Report.">
    <meta name="author" content="jonobr1">
    <meta name="image" content="http://archive.jono.fyi/projects/mueller-report/images/mueller-report.jpg">

  </head>
  <body>
`;

var body = `
  <h1>
    Word Occurrences in the Mueller Report
  </h1>
  <p>
    This is a list of unique words that show up in the Mueller Report. The words
    are sized and ordered by how frequently they show up in the document. To the
    right of each word is a number showing how many times it shows up in the
    document. The source material is taken from an automatically generated OCR
    reading of the US government distributed PDF by the
    <a href="https://archive.org/stream/mueller_report_20190422/" target="_blank">Internet Archive</a>.
  </p>
  <hr />
  <ul>
  <% for ( var i = 0; i < list.length; i++ ) { %>
    <% var word = list[ i ]; %>
    <% var item = contents[ word ]; %>
    <% var size = Math.floor( item.normal * 100 ) %>
    <% var value = item.value; %>
    <li>
      <span style="font-size: <%= size + 100 %>%"><%= word %></span>
      <span class="small-caps"><%= value %></span>
    </li>
  <% } %>
  </ul>
`;

var foot = `
  </body>
</html>
`;

function template(data) {

  var document = [
    head,
    _.template(body)(data),
    foot
  ].join('\n');

  fs.writeFile(path.resolve(__dirname, process.argv[3]), document, 'utf8', function(err) {

    if (err) {
      console.log(err);
      return;
    }

    console.log('Generated', process.argv[3]);

  });

}
