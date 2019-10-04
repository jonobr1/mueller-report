(function(root) {

  var drag = 0.1;
  var vector = new THREE.Vector3();

  var backdrop = root.backdrop = new THREE.Mesh(
     new THREE.SphereBufferGeometry( 500, 32, 32 ),
     new THREE.ShaderMaterial( {

        uniforms: {
           cSource: { type: 'c', value: new THREE.Color( 0x000000 ) },
           cTarget: { type: 'c', value: new THREE.Color( 0x000000 ) }
        },

        vertexShader: [

           'varying vec2 vUv;',

           'void main() {',

              'vUv = uv;',
              'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

           '}'

        ].join( '\n' ),

        fragmentShader: [

           'uniform vec3 cSource;',
           'uniform vec3 cTarget;',

           'varying vec2 vUv;',

           'void main() {',

              'vec3 pigment = mix( cSource, cTarget, vUv.y );',
              'gl_FragColor = vec4( pigment.rgb, 1.0 );',

           '}'

        ].join( '\n' ),

        side: THREE.BackSide

     } )
  );

  backdrop.userData.rotation = new THREE.Vector3();

  backdrop.userData.setSourceColor = function ( color ) {
     backdrop.userData.cSource = color;
     return backdrop;
  };

  backdrop.userData.setTargetColor = function ( color ) {
     backdrop.userData.cTarget = color;
     return backdrop;
  };

  backdrop.userData.update = function () {

     var source = backdrop.userData.cSource;
     var target = backdrop.userData.cTarget;

     if ( !backdrop.material.uniforms.cSource.value.equals( source ) ) {
        backdrop.material.uniforms.cSource.value.lerp( source, drag );
     }
     if ( !backdrop.material.uniforms.cTarget.value.equals( target ) ) {
        backdrop.material.uniforms.cTarget.value.lerp( target, drag );
     }
     if ( !backdrop.rotation.equals(backdrop.userData.rotation) ) {
       vector.copy( backdrop.rotation );
       vector.lerp( backdrop.userData.rotation, drag );
       backdrop.rotation.x = vector.x;
       backdrop.rotation.y = vector.y;
       backdrop.rotation.z = vector.z;
     }

     return backdrop;

  };

  backdrop.userData.randomizeRotation = function () {
    backdrop.userData.rotation.x += Math.random() * Math.PI - Math.PI / 2;
    backdrop.userData.rotation.y += Math.random() * Math.PI - Math.PI / 2;
    backdrop.userData.rotation.z += Math.random() * Math.PI - Math.PI / 2;
    return this;
  };

})(window);
