
#include <math.h>
#include <memory.h>
#include <emscripten.h>
#include <stdio.h>
#include <emscripten/html5.h>
#include "webgl.cpp"

int main()
{
  // emscripten_request_animation_frame_loop(&draw_frame, 0);
  printf("[WASM] Loaded\n");

  EM_ASM(
      if (typeof window != "undefined") {
        window.dispatchEvent(new CustomEvent("wasmLoaded"))
      } else {
          global.onWASMLoaded && global.onWASMLoaded()});

  return 0;
}

extern "C"
{
  EMSCRIPTEN_KEEPALIVE
  void init(int width, int height)
  {
    webgl_init(width, height);
  }

  EMSCRIPTEN_KEEPALIVE
  void updateTranslation(int x, int y)
  {
    update_translation(x, y);
  }

  EMSCRIPTEN_KEEPALIVE
  void updateRotation(int angle)
  {
    update_rotation(angle);
  }

  EMSCRIPTEN_KEEPALIVE
  void updateScale(int x, int y)
  {
    update_scale(x, y);
  }

  EMSCRIPTEN_KEEPALIVE
  void updateMouse(int x, int y)
  {
    update_mouse(x, y);
  }
}