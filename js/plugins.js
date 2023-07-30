THREE.Vector3.prototype.rotateAround = function (point, axis, angle) {
    var q = new THREE.Quaternion();
    q.setFromAxisAngle(axis, angle);

    this.sub(point);
    this.applyQuaternion(q);
    this.add(point);

    return this;
}