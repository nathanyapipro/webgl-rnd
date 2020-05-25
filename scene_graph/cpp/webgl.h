#pragma once

#ifdef __cplusplus
extern "C"
{
#endif

  // Creates WebGL context on DOM canvas element with ID "canvas". Sets CSS size and render target size to width&height.
  void webgl_init(int width, int height);

  void setRectangle(float x, float y, float width, float height);

  void draw();

#ifdef __cplusplus
}
#endif