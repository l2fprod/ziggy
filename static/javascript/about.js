function readPersonaData() {
  littleWonders(generated_personas);
}

function littleWonders(data) {

  var wonders = document.getElementById('wonders');

  data.forEach(function (persona) {

    var sketch = document.createElement('img');
    sketch.src = persona.sketch;
    sketch.className = "imageBowie";
    sketch.style.height = '240px';
    sketch.title = persona.name;
    sketch.onclick = function (e) {
      var path = './personality.html?persona=' + persona.name;
      window.open(path, '_self', false);
    }

    wonders.appendChild(sketch);
  })

}

window.onload = function () {
  readPersonaData();
}
