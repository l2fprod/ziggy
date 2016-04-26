var bowies = generated_personas;
var currentBowie = 0;

function fullBowies() {

  carousel = document.getElementById('carousel');
  var h = carousel.parentElement.parentElement.clientHeight;

  var personaHeight = h - 360;

  for (var count = 0; count < bowies.length; count++) {
    var item = document.createElement('div');
    item.dataset.bowie = bowies[count].name;
    item.className = 'bowieItem';
    var holder = document.createElement('div');
    var index = document.createElement('div');
    index.innerHTML = count + 1;
    index.className = "indexBowie";

    holder.className = "holder";
    var image = document.createElement('img');
    image.src = bowies[count].image;
    image.className = "imageBowie";

    image.style.height = personaHeight + "px";

    image.id = item.dataset.bowie;

    image.onclick = shareInsight;

    holder.backgroundColor = bowies[count].background;

    var description = document.createElement('div');
    description.innerHTML = bowies[count].name;
    description.className = "aboutBowie";

    var style = document.createElement('div');
    style.innerHTML = bowies[count].style;
    style.className = "styleBowie";

    var date = document.createElement('div');
    date.innerHTML = bowies[count].date;
    date.className = "timeBowie";

    holder.appendChild(image);
    holder.appendChild(description);

    if (count != 0) {
      var gap = bowies[0].element.clientHeight;
      item.style.marginTop = '-' + gap + 'px';
      item.style.margin
      item.style.top = bowies[0].element.style.top;
      item.style.opacity = 0;

      carousel.style.marginTop = gap + 'px';
    }

    bowies[count].element = item;

    item.style.zIndex = count + 1;
    item.style.order = bowies.length - count;

    var c = personaHeight * count;

    item.appendChild(holder);

    carousel.appendChild(item);
  }

  currentBowie = 0;
  var gap = bowies[0].element.clientHeight;
  bowies[0].element.style.marginTop = '-' + gap + 'px';
}

function chooseBowie(index) {

  bowies[currentBowie].element.style.opacity = 0;
  bowies[currentBowie].node.className = 'nodeDimmed';
  bowies[currentBowie].nodeLabel.className = 'startDimmed';

  bowies[index].element.style.opacity = 1;
  bowies[index].node.className = 'nodeLit';
  bowies[index].nodeLabel.className = 'startLit';

  currentBowie = index;
}

function addTimeLine() {

  var timeline = document.getElementById('timeline');
  var count = 0;

  bowies.forEach(function (bowie) {
    var entry = document.createElement('div');
    entry.className = 'entry';
    entry.dataset.index = count;
    entry.dataset.bowie = bowie.name;

    entry.onclick = function (e) {
      var index = e.target.dataset.index;
      chooseBowie(index);
    }

    bowie.node = document.createElement('div');
    bowie.node.className = 'nodeDimmed';
    bowie.node.dataset.index = count;
    entry.appendChild(bowie.node);

    bowie.line = document.createElement('div');
    bowie.line.className = 'nodeLine';
    entry.appendChild(bowie.line);

    bowie.nodeLabel = document.createElement('div');
    bowie.nodeLabel.innerHTML = bowie.start;
    bowie.nodeLabel.className = 'startDimmed';
    entry.appendChild(bowie.nodeLabel);

    if (count === 0) {
      bowie.node.className = 'nodeLit';
      bowie.nodeLabel.className = 'startLit';
    }

    timeline.appendChild(entry);
    count++;
  })
}

function compare(e) {
  var path = 'comparison.html';

  window.open(path, '_self', false);
}

function persona(e) {
  var path = './persona.html';

  window.open(path, '_self', false);
}

function about(e) {
  var path = './about.html';

  window.open(path, '_self', false);
}

function shareInsight(e) {
  var path = './personality.html?persona=' + bowies[currentBowie].name;

  window.open(path, '_self', false);
}

window.onresize = function () {
  carousel = document.getElementById('carousel');
  carousel.innerHTML = null;
  fullBowies();
}

window.onload = function () {
  fullBowies();
  addTimeLine();

  var nextBowie;
  var cap = bowies.length - 1

  setInterval(function () {

    if (currentBowie < cap) {
      nextBowie = currentBowie + 1;
    } else {
      nextBowie = 0;
    }
    chooseBowie(nextBowie);
  }, 4000);
}
