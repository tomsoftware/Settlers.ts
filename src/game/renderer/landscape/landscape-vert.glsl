// ///////////
// set vertex index of ONE instance
//         0 3      5
//         /\\------/
//        /  \\  B /
//       /  A \\  /
//      /------\\/
//     1       2 4
attribute float baseVerticesIndex; // 0, 1, 2, 3, 4, 5

// ///////////
// set the instance index
//      /-----/-----/-----/
//     / 0,0 / 1,0 / 2,0 /
//    /-----/-----/-----/
//   / 0,1 / 1,1 / 2,1 /
//  /-----/-----/-----/
attribute vec2 instancePos;

uniform mat4 projection;

#ifdef DEBUG_TRIANGLE_BORDER
  varying vec3 v_barycentric;
#endif

varying vec2 v_texcoord;

vec2 mapSize = vec2(MAP_HEIGHT, MAP_WIDTH);
vec2 mapPos = vec2(-100.0, 10.0);

// texture position of the ground where [R G B A] is mapped to [Ax Ay Bx By]
//  so Ax is x-pos for triangle A and By for y-pos of triangle B
//      /-----------------/-----------------/-----------------/
//     / Ax0 Ay0 Bx0 By0 / Ax1 Ay0 Bx1 By0 / Ax2 Ay0 Bx2 By0 /
//    /-----------------/-----------------/-----------------/
//   / Ax0 Ay1 Bx0 By1 / Ax1 Ay1 Bx1 By1 / Ax2 Ay1 Bx2 By1 /
//  /-----------------/-----------------/-----------------/
uniform sampler2D u_landTypeBuffer;

void main() {
  // ///////////
  // set base vertex properties
  // define base map shape as a parallelogram
  // so we always draw the same vertices
  //        (0/0)    (1/0)
  //         0 3      5
  //         /\\------/
  //        /  \\  B /
  //       /  A \\  /
  //      /------\\/
  //     1       2 4
  // (-0.5/1)  (0.5/1)
  vec2 baseVerticesPos; // (0,0) or (-0.5,1) or ...

  // triangle A or B ?
  int baseVertecesTypeAorB;

  if (baseVerticesIndex < 3.0) {
    baseVertecesTypeAorB = 0;
    if (baseVerticesIndex == 0.0) {
      // 0
      baseVerticesPos = vec2(0.0, 0.0);
    }
    else if (baseVerticesIndex == 1.0) {
      // 1
      baseVerticesPos = vec2(-0.5, 1.0);
    }
    else {
      // 2
      baseVerticesPos = vec2(0.5, 1.0);
    }
  }
  else {
    baseVertecesTypeAorB = 1;
    if (baseVerticesIndex == 3.0) {
      // 3
      baseVerticesPos = vec2(0.0, 0.0);
    }
    else if (baseVerticesIndex == 4.0) {
      // 4
      baseVerticesPos = vec2(0.5, 1.0);
    }
    else {
      // 5
      baseVerticesPos = vec2(1.0, 0.0);
    }
  }


  ///////
  #ifdef DEBUG_TRIANGLE_BORDER
    if (baseVerticesPos.x == 0.0) {
      v_barycentric = vec3(1, 0, 0);
    }
    else if (baseVerticesPos.x == 0.5) {
      v_barycentric = vec3(0, 1, 0);
    }
    else {
      v_barycentric = vec3(0, 0, 1);
    }
  #endif

  // https://webglfundamentals.org/webgl/lessons/webgl-pulling-vertices.html
  vec2 pixelCoord = instancePos + mapPos;

  // check if position is in map position
  if (pixelCoord.x < 0.0 || pixelCoord.x >= mapSize.x 
      || pixelCoord.y < 0.0 || pixelCoord.y >= mapSize.y) {
        // out of map
        v_texcoord = vec2(-1, -1);
        return;
  }
 
  // read the land-texture-type for the data-texture
  vec2 texcoord = pixelCoord / mapSize;
  vec4 type = texture2D(u_landTypeBuffer, texcoord);

  vec2 text_scale = vec2(1.0, 1.0) / vec2(8, 352);

  vec2 real_text_pos;
  if (baseVertecesTypeAorB == 0) {
    // for triangle A use
    real_text_pos = type.xy * vec2(127, 255); // x is scaled by 
  }
  else {
    // for triangle B use
    real_text_pos = type.zw * vec2(127, 255);
  }

  gl_Position = projection *
      vec4(
        baseVerticesPos.x + instancePos.x - instancePos.y * 0.5,
        baseVerticesPos.y + instancePos.y,
        0,
        1 /* not sure why this needs to be 1 ??? */
      );

  // Pass the vertex color/texture to the fragment shader.
  //v_barycentric = color;
  v_texcoord = (baseVerticesPos.xy + real_text_pos.xy) * text_scale;
}
