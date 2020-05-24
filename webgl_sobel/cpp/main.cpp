// #include "webgl.h"
#include <math.h>
#include <memory.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include "Context.cpp"

Context *glContext;

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
  void clearContext(void)
  {
    if (glContext)
      delete glContext;
  }

  EMSCRIPTEN_KEEPALIVE
  void createContext(int width, int height, char *id)
  {
    glContext = new Context(width, height, id);
    free(id);
  }

  EMSCRIPTEN_KEEPALIVE
  void loadTexture(uint8_t *buf, int bufSize)
  {
    printf("[WASM] Loading Texture \n");

    glContext->run(buf);
    free(buf);
  }
}