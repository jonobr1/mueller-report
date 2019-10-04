(function(root) {

  var _ = Two.Utils;

  Two.Text.Ratio = 1;

  var Intertitles = root.Intertitles = function(dimensions) {

    var scope = this;
    var two = this.two = new Two({
      type: Two.Types.canvas,
      width: 1024,
      height: 1024,
      ratio: 2
    });

    var text = this.text = two.makeText('', 0, 0, {
      fill: 'white',
      stroke: 'transparent',
      family: '"Knockout HTF26-JuniorFlyweight", sans-serif'
    });

    var plane = this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(dimensions, dimensions, 128, 128),
      new THREE.ShaderMaterial({

        uniforms: {
          dimensions: { type: 'f', value: dimensions },
          time: { type: 'f', value: 0 },
          speed: { type: 'f', value: 1 },
          turbulence: { type: 'v2', destination: new THREE.Vector2(), value: new THREE.Vector2( 0, 0 ) },
          color: { type: 'c', value: new THREE.Color(0xffffff) },
          map: { type: 't', value: new THREE.Texture(two.renderer.domElement) },
          opacity: { type: 'f', value: 1 }
        },

        vertexShader: [

          'const float PI =' + Math.PI + ';',
          'uniform float dimensions;',
          'uniform float speed;',
          'uniform float time;',
          'uniform vec2 turbulence;',

          'varying vec2 vUv;',

          'vec2 hash( vec2 x ) {',
            'const vec2 k = vec2( 0.3183099, 0.3678794 );',
            'x = x * k + k.yx;',
            'return 2.0 * fract( 16.0 * k * fract( x.x * x.y * ( x.x + x.y ) ) ) - 1.0;',
          '}',

          'float noise( in vec2 p ) {',
            'vec2 i = floor( p );',
            'vec2 f = fract( p );',

            'vec2 u = f * f * ( 3.0 - 2.0 * f );',

            'return mix( mix( dot( hash( i + vec2( 0.0, 0.0 ) ), f - vec2( 0.0, 0.0 ) ),',
                             'dot( hash( i + vec2( 1.0, 0.0 ) ), f - vec2( 1.0, 0.0 ) ), u.x ),',
                        'mix( dot( hash( i + vec2( 0.0, 1.0 ) ), f - vec2( 0.0, 1.0 ) ),',
                             'dot( hash( i + vec2( 1.0, 1.0 ) ), f - vec2( 1.0, 1.0 ) ), u.x ), u.y );',
          '}',

          'void main() {',

            'vUv = uv;',

            'vec2 n = 2.0 * ( vec2( uv ) - 0.5 );',
            'float dist = distance( n, turbulence );',
            'n += turbulence * max( 1.0 - dist, 0.0 );',
            'vec3 pos = vec3( dimensions * n * 0.5, position.z );',

            'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

          '}'

        ].join('\n'),

        fragmentShader: [

          'uniform vec3 color;',
          'uniform sampler2D map;',
          'uniform float opacity;',

          'varying vec2 vUv;',

          'void main() {',
            'vec4 texel = texture2D( map, vUv );',
            'gl_FragColor = vec4( color, texel.a * opacity );',
          '}'

        ].join('\n'),

        // wireframe: true,
        transparent: true

      })
    );

    plane.userData.active = false;

    two.scene.position.set(two.width / 2, two.height / 2);

    this.update = update;

    function update(elapsed) {

      plane.material.uniforms.time.value = elapsed;

      if (!plane.userData.active) {
        plane.material.uniforms.opacity.value
          -= plane.material.uniforms.opacity.value * 0.1;
      }

      var turbulence = plane.material.uniforms.turbulence;
      turbulence.value.x += (turbulence.destination.x - turbulence.value.x) * 0.33;
      turbulence.value.y += (turbulence.destination.y - turbulence.value.y) * 0.33;

      if (pressure > 0) {
        var x = pressure * (Math.random() - 0.5) / 2;
        var y = pressure * (Math.random() - 0.5) / 2;
        plane.position.set(x, y, 0);
      } else if (plane.position.x !== 0
        || plane.position.y !== 0 || plane.position.z !== 0) {
        plane.position.set(0, 0, 0);
      }

    }

  }

  Intertitles.Fonts = new Fonts([
    {
      value: 'Knockout HTF66-FullFlyweight',
      url: './assets/fonts/Knockout-26.otf'
    },
    {
      value: 'Knockout HTF67-FullBantamweight',
      url: './assets/fonts/Knockout-27.otf'
    },
    {
      value: 'Knockout HTF68-FullFeatherweight',
      url: './assets/fonts/Knockout-48.otf'
    },
    {
      value: 'Knockout HTF69-FullLiteweight',
      url: './assets/fonts/Knockout-49.otf'
    },
    {
      value: 'Knockout HTF70-FullWelterweight',
      url: './assets/fonts/Knockout-70.otf'
    },
    {
      value: 'Knockout HTF71-FullMiddleweight',
      url: './assets/fonts/Knockout-71.otf'
    },
    {
      value: 'Knockout HTF72-FullCruiserweight',
      url: './assets/fonts/Knockout-72.otf'
    },
    {
      value: 'Knockout HTF73-FullHeviweight',
      url: './assets/fonts/Knockout-93.otf'
    },
    {
      value: 'Knockout HTF74-FullSumo',
      url: './assets/fonts/Knockout-94.otf'
    }
  ]);

  _.extend(Intertitles.prototype, {

    constructor: Intertitles,

    appendTo: function(mesh) {
      mesh.add(this.plane);
      return this;
    },

    set: function(word) {

      var text = this.text;
      var two = this.two;
      var plane = this.plane;

      if (_.isObject(word)) {
        text.value = word.value.toUpperCase();
        palette.drag = 1 / word.length;
      } else {
        text.value = word.toUpperCase();
      }

      text.scale = 1;

      var rect = text.getBoundingClientRect(true);
      text.scale = Math.min(two.height / rect.height, two.width / rect.width, 10);

      two.update();

      plane.material.uniforms.map.value.needsUpdate = true;
      plane.material.uniforms.opacity.value = 1;
      plane.userData.active = true;

      return this;

    },

    setFamily: function(family) {
      var text = this.text;
      text.family = family;
      return this;
    }

  });

})(window);
