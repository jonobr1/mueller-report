(function(root) {

	var amount = 10000;

	var geometry = new THREE.BufferGeometry();
	var positions = [];
	var sizes = [];
	var lifeTimes = [];
	var rotations = [];

	var vertexShader = [

		'uniform float amplitude;',
		'uniform float time;',
		'uniform vec3 wind;',
		'uniform float turbulence;',
		'uniform float radius;',

		'attribute float size;',
		'attribute float life;',
		'attribute vec3 axisRotation;',

		'varying float lived;',
		'varying vec3 particle;',
		'varying vec3 up;',
		'varying float range;',

		'float noise( float p ) {',
		  'return sin( p );',
		'}',

		'void main() {',

		  'float variation = pow( size, 0.33 );',
		  'float lifetime = life * 1000.0;',

		  'lived = mod( time, lifetime ) / lifetime;',

		  'vec3 destination = position + variation * wind * lived;',
		  'vec3 field = vec3(',
			'( wind.y + wind.z ) * noise( destination.y + destination.z ),',
			'( wind.x + wind.z ) * noise( destination.x + destination.z ),',
			'( wind.x + wind.y ) * noise( destination.x + destination.y )',
		  ');',
		  'field *= turbulence;',

		  'vec3 pos = mix( destination, destination + field, lived );',
	      'vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );',

		  'particle = pos;',
		  'up = axisRotation;',
		  'range = smoothstep( radius * 0.85, radius, length( pos ) );',

		  'gl_PointSize = amplitude * size * 12.0;',
		  'gl_Position = projectionMatrix * mvPosition;',

		'}'

	].join( '\n' );

	var fragmentShader = [

		'const float PI = 3.141592653589793;',

		'uniform float time;',
		'uniform vec3 specular;',
		'uniform vec3 camera;',

		'varying float lived;',
		'varying vec3 particle;',
		'varying vec3 up;',
		'varying float range;',

		'mat3 setCamera( in vec3 ro, in vec3 ta, float cr ) {',

		  'vec3 cw = normalize( ta - ro );',
		  'vec3 cp = vec3( sin( cr ), cos( cr ), 0.0 );',
		  'vec3 cu = normalize( cross( cw, cp ) );',
		  'vec3 cv = normalize( cross( cu, cw ) );',

		  'return mat3( cu, cv, cw );',

		'}',

		'float sdCapsule( in vec3 p, vec3 a, vec3 b, float r ) {',
		  'vec3 pa = p - a, ba = b - a;',
		  'float h = clamp( dot( pa, ba )/dot( ba, ba ), 0.0, 1.0 );',
		  'return length( pa - ba * h ) - r;',
		'}',

		'vec2 map( in vec3 sight ) {',

		  '// Of the object',
		  'vec3 position = vec3( 0.0 );',
		  '// The vec3 position of the left side of capsule',
		  'vec3 a = vec3( - 1.25, 0.0, 0.0 );',
		  '// The vec3 position of the right side of capsule',
		  'vec3 b = vec3( 1.25, 0.0, 0.0 );',
		  '// Radius of the capsule',
		  'float radius = 0.33;',

		  '// Define position in relation to the camera',
		  'position = sight - position;',
		  'vec3 worldPosition = position;',

		  'float sdf = sdCapsule( worldPosition, a, b, radius );',
		  'vec2 res = vec2( sdf, 0.0 );',

		  'return res;',

		'}',

		'vec2 castRay( in vec3 ro, in vec3 rd ) {',

		  '// Near / Far Clipping Plane',
		  'float tmin = 1.0;',
		  'float tmax = 50.0;',

		  'float t = tmin;',
		  'float m = - 1.0;',

		  '// TODO: Why does it need so many iterations',
		  '// to march correctly?',
		  'for( int i = 0; i < 128; i++ ) {',

			'float precis = 0.0004 * t;',
			'vec2 res = map( ro + rd * t );',

			'// Means no intersection',
			'// and no possibility of checking again',
			'// so stop the Ray Marching',
			'if ( res.x < precis || t > tmax ) break;',

			  't += res.x;',
			  'm = res.y; // Identify which shape was intersected via a float',

			'}',

			'if( t > tmax ) m =- 1.0;',
			'return vec2( t, m );',

		'}',

		'// https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/',
		'vec4 quat_from_axis_angle( vec3 axis, float angle ) {',
		  'float half_angle = angle * 0.5;',
		  'float s = sin( half_angle );',
		  'return vec4( axis.xyz * s, cos( half_angle ) );',
		'}',

		'// https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/',
		'vec3 rotate( vec3 position, vec3 axis, float angle ) {',
		  'vec4 q = quat_from_axis_angle( axis, angle );',
		  'vec3 v = position.xyz;',
		  'return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );',
		'}',

		'void main() {',

		  'float theta = ( time / 1000.0 ) * length( up );',
		  'theta = mod( theta, PI * 2.0 );',

		  'vec2 uv = 2.0 * vec2( gl_PointCoord ) - 1.0;',
		  'vec3 ro = normalize( camera - particle );',

		  'ro = rotate( ro, up, theta );',
		  'ro *= 10.0 / length( ro );',

		  'vec3 ta = vec3( 0.0, 0.0, 0.0 );',
		  'mat3 ca = setCamera( ro, ta, 0.0 );',

		  'vec3 rd = ca * normalize( vec3( uv.xy, 5.0 ) );',
		  'vec2 res = castRay( ro, rd );',

		  'float t = res.x;',
		  'float m = res.y;',
		  'float alpha = step( 0.0, m );',

		  'vec3 texel = specular;',
		  'float easeInOut = sin( lived * PI );',
		  'float spherical = 1.0 - range;',

		  'gl_FragColor = vec4( texel, alpha * easeInOut * spherical );',

		'}'

	].join( '\n' );

	for ( var i = 0; i < amount; i++ ) {

	  positions.push( Math.random() - 0.5 );
	  positions.push( Math.random() - 0.5 );
	  positions.push( Math.random() - 0.5 );

	  sizes.push( Math.random() );
	  lifeTimes.push( Math.random() * 19 + 1 );

	  rotations.push( ( 2 * Math.random() - 1 ) );
	  rotations.push( ( 2 * Math.random() - 1 ) );
	  rotations.push( ( 2 * Math.random() - 1 ) );

	}

	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
	geometry.addAttribute( 'life', new THREE.Float32BufferAttribute( lifeTimes, 1 ) );
	geometry.addAttribute( 'axisRotation', new THREE.Float32BufferAttribute( rotations, 3 ) );

	var material = new THREE.ShaderMaterial({
	  uniforms: {
		amplitude: { type: 'f', value: 1 },
		specular: { type: 'c', value: new THREE.Color( 0.5, 0.5, 0.66 ) },
		wind: { type: 'v3', value: new THREE.Vector3( 0, 0.02, 0.1 ) },
		time: { type: 'f', value: 0 },
		turbulence: { type: 'f', value: 0.1 },
		camera: { type: 'v3', value: new THREE.Vector3() },
		radius: { type: 'f', value: 0.5 }
	  },
	  vertexShader: vertexShader,
	  fragmentShader: fragmentShader,
	  transparent: true,
	  depthWrite: false
	  // depthTest: false
	});

	var debris = root.debris = new THREE.Points( geometry, material );
	debris.scale.setScalar( 200 );
	debris.renderOrder = 150;
	debris.userData.update = update;
	debris.userData.amplitude = material.uniforms.amplitude.value;
	debris.userData.time = 0;

	function update( time ) {

		var amplitude = material.uniforms.amplitude;

		if ( amplitude.value !== debris.userData.amplitude ) {
			amplitude.value += ( debris.userData.amplitude - amplitude.value ) * 0.1;
		}

		material.uniforms.time.value = time;

	}

})(window);
