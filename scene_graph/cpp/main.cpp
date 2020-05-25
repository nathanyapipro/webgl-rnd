
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
}