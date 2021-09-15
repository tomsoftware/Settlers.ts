precision mediump float;

// Passed in from the vertex shader.
varying vec3 v_barycentric;

// Passed in from the vertex shader.
varying vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord);

  #ifdef DEBUG_TRIANGLE_BORDER
    // draw triangle border
    if (any(lessThan(v_barycentric, vec3(0.02)))) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  #endif

  // gl_FragColor = v_barycentric;
  // gl_FragColor = texture2D(u_texture, v_texcoord);
}
