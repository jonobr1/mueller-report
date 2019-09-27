var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var readline = require('readline');

var source = {
  path: process.argv[2]
};

var result = {
  total: 0,
  contents: {},
  list: [],
  maxOccurrence: 0,
  totalOccurrences: 0
};

setup();

function setup() {

  if (!source.path) {
    console.error('A source path is required to tabulate. Please pass as first argument');
    return;
  }

  var reader = readline.createInterface({
    input: fs.createReadStream(path.resolve(__dirname,source.path))
  });

  reader.on('line', tabulate);
  reader.on('close', analyze);

}

function tabulate(line) {

  var words = line.split(/\s/);

  for (var i = 0; i < words.length; i++) {

    var word = words[i];
    var keyword = word.replace(/\W/ig, '').toLowerCase();
    var isURL = /^https/i.test(word);

    if (keyword.length < 3 || isURL || !_.isNaN(parseFloat(keyword))) {
      continue;
    }

    if (result.contents[keyword]) {
      result.contents[keyword].value++;
      result.maxOccurrence = Math.max(
        result.maxOccurrence, result.contents[keyword].value);
      result.totalOccurrences++;
    } else {
      result.contents[keyword] = {
        index: result.total,
        value: 1
      };
      result.total++;
      result.totalOccurrences++;
    }

  }

}

function analyze() {

  for (var word in result.contents) {

    var item = result.contents[word];
    var value = item.value;

    result.list.push(word);

  }

  result.list = _.sortBy(result.list, comparator);
  _.each(result.list, updateIndex);
  save();

}

function comparator(a) {
  // Descending order
  return - result.contents[a].value;
}

function updateIndex(word, i) {
  result.contents[word].index = i;
  result.contents[word].normal = toFixed(result.contents[word].value / result.maxOccurrence);
  result.contents[word].percentage = toFixed(result.contents[word].value / result.totalOccurrences);
}

function toFixed(v) {
  return Math.floor(v * 1000) / 1000;
}

function save() {

  var filepath = source.path.replace(/\.[\w\d]+$/, '.json');
  var contents = JSON.stringify(result);

  fs.writeFile(path.resolve(__dirname, filepath), contents, 'utf8', function(err) {

    if (err) {
      console.log(err);
      return;
    }

    console.log('Finished tabulating');

  });

}
