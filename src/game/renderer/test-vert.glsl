attribute vec4 a_position;
attribute vec4 color;
attribute vec2 map_pos;
uniform mat4 projection;

varying vec4 v_color;

void main() {

  gl_Position = projection * (a_position + vec4(map_pos.x - map_pos.y * 0.5, map_pos.y, 0, 0)) * vec4(0.1, 0.1, 1, 1);

  // Pass the vertex color to the fragment shader.
  v_color = color;
}
