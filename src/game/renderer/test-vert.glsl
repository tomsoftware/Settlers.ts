attribute vec4 a_position;
attribute vec4 color;
attribute mat4 matrix;
uniform mat4 projection;
uniform mat4 view;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = projection * view * matrix * a_position;

  // Pass the vertex color to the fragment shader.
  v_color = color;
}
