#pragma once

#ifdef __cplusplus
extern "C"
{
#endif

  // Creates WebGL context on DOM canvas element with ID "canvas". Sets CSS size and render target size to width&height.
  void webgl_init(int width, int height);

  void set_rectangle();

  void draw_scene();

  void update_translation(int x, int y);
  void update_rotation(int angle);
  void update_scale(int x, int y);

#ifdef __cplusplus
}
#endif