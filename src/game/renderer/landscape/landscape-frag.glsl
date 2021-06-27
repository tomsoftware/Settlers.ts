precision mediump float;

// Passed in from the vertex shader.
//varying vec4 v_color;

// Passed in from the vertex shader.
varying vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

void main() {
  //gl_FragColor = v_color;
  gl_FragColor = texture2D(u_texture, v_texcoord);
}
