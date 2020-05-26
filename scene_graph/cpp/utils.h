#pragma once
#ifdef __cplusplus
extern "C"
{
#endif

  // Creates WebGL context on DOM canvas element with ID "canvas". Sets CSS size and render target size to width&height.

  void matrix_multiply(float mat1[9],
                       float mat2[9],
                       float res[9]);
  void matrix_identity(float res[9]);
  void matrix_translation(float tx, float ty, float res[9]);
  void matrix_scaling(float sx, float sy, float res[9]);
  void matrix_rotation(float angleDeg, float res[9]);
#ifdef __cplusplus
}
#endif