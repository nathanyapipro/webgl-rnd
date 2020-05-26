#include <GLES2/gl2.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <string.h>
#include <assert.h>
#include "utils.h"

// This function multiplies
// mat1[][] and mat2[][], and
// stores the result in res[][]
float identity[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
float PI = 3.14159265;

void matrix_multiply(float mat1[9],
                     float mat2[9],
                     float res[9])
{
  float a00 = mat1[0 * 3 + 0];
  float a01 = mat1[0 * 3 + 1];
  float a02 = mat1[0 * 3 + 2];
  float a10 = mat1[1 * 3 + 0];
  float a11 = mat1[1 * 3 + 1];
  float a12 = mat1[1 * 3 + 2];
  float a20 = mat1[2 * 3 + 0];
  float a21 = mat1[2 * 3 + 1];
  float a22 = mat1[2 * 3 + 2];
  float b00 = mat2[0 * 3 + 0];
  float b01 = mat2[0 * 3 + 1];
  float b02 = mat2[0 * 3 + 2];
  float b10 = mat2[1 * 3 + 0];
  float b11 = mat2[1 * 3 + 1];
  float b12 = mat2[1 * 3 + 2];
  float b20 = mat2[2 * 3 + 0];
  float b21 = mat2[2 * 3 + 1];
  float b22 = mat2[2 * 3 + 2];

  res[0] =
      b00 * a00 + b01 * a10 + b02 * a20;
  res[1] = b00 * a01 + b01 * a11 + b02 * a21;
  res[2] = b00 * a02 + b01 * a12 + b02 * a22;
  res[3] = b10 * a00 + b11 * a10 + b12 * a20;
  res[4] = b10 * a01 + b11 * a11 + b12 * a21;
  res[5] = b10 * a02 + b11 * a12 + b12 * a22;
  res[6] = b20 * a00 + b21 * a10 + b22 * a20;
  res[7] = b20 * a01 + b21 * a11 + b22 * a21;
  res[9] = b20 * a02 + b21 * a12 + b22 * a22;
}

void matrix_translation(float tx, float ty, float res[9])
{
  res[0] = 1;
  res[1] = 0;
  res[2] = 0;
  res[3] = 0;
  res[4] = 1;
  res[5] = 0;
  res[6] = tx;
  res[7] = ty;
  res[8] = 1;
}

void matrix_scaling(float sx, float sy, float res[9])
{
  res[0] = sx;
  res[1] = 0;
  res[2] = 0;
  res[3] = 0;
  res[4] = sy;
  res[5] = 0;
  res[6] = 0;
  res[7] = 0;
  res[8] = 1;
}

void matrix_rotation(float rx, float ry, float res[9])
{

  res[0] = ry;
  res[1] = -rx;
  res[2] = 0;
  res[3] = rx;
  res[4] = ry;
  res[5] = 0;
  res[6] = 0;
  res[7] = 0;
  res[8] = 1;
}