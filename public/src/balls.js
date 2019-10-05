(function(root) {

  var _ = Two.Utils;

  var balls = root.balls = new THREE.Group();
  var amount = 1024;
  var active = [];
  var index = 0;

  var geometry = new THREE.SphereBufferGeometry(10, 32, 32);
  var dimensions = 200;
  for (var i = 0; i < amount; i++) {

    var x = Math.random() * dimensions - dimensions * 0.5;
    var y = Math.random() * dimensions - dimensions * 0.5;
    var z = Math.random() * dimensions - dimensions * 0.5;
    var ball = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: 0xff0000,
      // wireframe: true
    }));
    ball.position.set(x, y, z);
    ball.visible = false;

    balls.add(ball);

  }

  balls.userData.update = function() {

    for (var i = 0; i < active.length; i++) {
      var ball = active[i];
      ball.scale.x -= ball.scale.x * 0.2;
      ball.scale.y = ball.scale.x;
      ball.scale.z = ball.scale.x;
      // ball.material.opacity =
      if (ball.scale.x <= 0.001) {
        active.splice(i, 1);
        ball.visible = false;
      }
    }

    return balls;

  };

  balls.userData.trigger = function() {

    var ball = balls.children[index];
    var wasVisible = ball.visible
    ball.visible = true;

    var scale = Math.random() + 1;
    ball.scale.set(scale, scale, scale);

    var r = Math.random();
    var gb = r * Math.random();
    ball.material.color.setRGB(gb, gb, gb);

    if (!wasVisible) {
      active.push(ball);
    }
    index = (index + 1) % balls.children.length;

    return balls;

  };

})(window);
