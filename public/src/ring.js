(function(root) {

  var _ = Two.Utils;
  var drag = 0.4;
  var vector = new THREE.Vector3();

  var Ring = root.Ring = function(size, color) {

    THREE.Group.call(this);

    this.current = new THREE.Mesh(Ring.Geometry, Ring.Material.clone());
    this.reference = new THREE.Mesh(Ring.Geometry, Ring.Material.clone());

    this.userData.rotation = new THREE.Vector3();
    this.userData.direction = new THREE.Vector3();
    this.current.userData.rotation = new THREE.Vector3();
    this.reference.userData.rotation = new THREE.Vector3();

    this.current.material.color.set( color )
    this.reference.material.color.set( color );
    this.reference.material.color.r *= 0.33;
    this.reference.material.color.g *= 0.33;
    this.reference.material.color.b *= 0.33;
    this.add(this.current);
    this.add(this.reference);

    this.current.scale.x = size / 100;
    this.current.scale.y = size / 100;
    this.current.scale.z = size / 100;

    this.reference.scale.x = ( size / 100 ) + 0.5;
    this.reference.scale.y = ( size / 100 ) + 0.5;
    this.reference.scale.z = ( size / 100 ) + 0.5;

    this.reset();

  };

  Ring.Geometry = new THREE.TorusBufferGeometry(100, 2, 3, 128);
  Ring.Material = new THREE.MeshBasicMaterial({
    color: 0xff3232,
    // blending: THREE.MultiplyBlending,
    transparent: true
  });

  _.extend(Ring.prototype, THREE.Group.prototype, {

    constructor: Ring,

    advance: function(pct) {

      vector
        .copy( this.userData.direction )
        .setLength( Math.PI )
        .add( this.reference.userData.rotation );

      this.current.userData.rotation.copy( this.reference.userData.rotation );
      this.current.userData.rotation.lerp( vector, pct );

      return this;

    },

    reset: function() {

      this.userData.direction.x = 0;
      this.userData.direction.y = 2 * (Math.random() - 0.5);
      this.userData.direction.z = 0;

      this.userData.direction.normalize();

      this.reference.userData.rotation.x = 2 * (Math.random() - 0.5) * Math.PI * 2;
      this.reference.userData.rotation.y = 2 * (Math.random() - 0.5) * Math.PI * 2;
      this.reference.userData.rotation.z = 2 * (Math.random() - 0.5) * Math.PI * 2;
      this.current.rotation.x = this.reference.rotation.x;
      this.current.rotation.y = this.reference.rotation.y;
      this.current.rotation.z = this.reference.rotation.z;
      this.current.userData.rotation.copy( this.reference.userData.rotation );

      return this;

    },

    update: function() {

      if ( !this.rotation.equals( this.userData.rotation ) ) {

        vector.copy( this.rotation );
        vector.lerp( this.userData.rotation, drag / 2 );

        this.rotation.x = vector.x;
        this.rotation.y = vector.y;
        this.rotation.z = vector.z;

      }

      if ( !this.current.rotation.equals( this.current.userData.rotation ) ) {

        vector.copy( this.current.rotation );
        vector.lerp( this.current.userData.rotation, drag );

        this.current.rotation.x = vector.x;
        this.current.rotation.y = vector.y;
        this.current.rotation.z = vector.z;

      }

      if ( !this.reference.rotation.equals( this.reference.userData.rotation ) ) {

        vector.copy( this.reference.rotation );
        vector.lerp( this.reference.userData.rotation, drag );

        this.reference.rotation.x = vector.x;
        this.reference.rotation.y = vector.y;
        this.reference.rotation.z = vector.z;

      }

      return this;

    },

    randomizeRotation: function() {
      this.userData.rotation.x += Math.random() * Math.PI - Math.PI / 2;
      this.userData.rotation.y += Math.random() * Math.PI - Math.PI / 2;
      this.userData.rotation.z += Math.random() * Math.PI - Math.PI / 2;
      return this;
    }

  });

})(window);
