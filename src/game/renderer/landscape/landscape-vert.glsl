attribute vec4 a_position;
attribute vec4 texture_array;
attribute vec2 map_pos;
uniform mat4 projection;

//varying vec4 v_color;
varying vec2 v_texcoord;

void main() {

  vec2 text_scale = vec2(1.0, 1.0) / vec2(8, 352);

  vec2 real_text_pos;
  vec4 real_pos;
  if (a_position.x < 0.0) {
    real_pos = vec4(a_position.x + 1.0, a_position.y, a_position.z, a_position.w);
    real_text_pos = texture_array.xy;
  }
  else {
    real_pos = a_position;
    real_text_pos = texture_array.zw;
  }

  gl_Position = projection * (real_pos + vec4(map_pos.x - map_pos.y * 0.5, map_pos.y, 0, 0)) * vec4(0.1, 0.1, 1, 1);

  // Pass the vertex color to the fragment shader.
  //v_color = color;
  v_texcoord = (real_pos.xy + real_text_pos.xy) * text_scale;
}
