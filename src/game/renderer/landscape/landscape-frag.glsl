precision mediump float;

// input form vertex sheder: Barycentric Coordinate
varying vec3 v_barycentric;

// input form vertex sheder: landscape texture
varying vec2 v_texcoord;

// input form vertex sheder: gray
varying float v_shader_color;

// The texture.
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord) * vec4(v_shader_color, v_shader_color, v_shader_color, 1.0);

  #ifdef DEBUG_TRIANGLE_BORDER
    // draw triangle border
    if (any(lessThan(v_barycentric, vec3(0.02)))) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  #endif

  // gl_FragColor = v_barycentric;
  // gl_FragColor = texture2D(u_texture, v_texcoord);
}
