# Compile emscripten

```
emcc -o ./dist/{OUTPUT}.js ./cpp/{SOURCE}.cpp -s ALLOW_MEMORY_GROWTH=1  -s WASM=1 -s NO_EXIT_RUNTIME=1 -std=c++1z -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'stringToUTF8']" -s LINKABLE=1 -s EXPORT_ALL=1 -s ASSERTIONS=1  -s FULL_ES3=1 -s FULL_ES2=1  -s OFFSCREEN_FRAMEBUFFER=1 -s MAX_WEBGL_VERSION=2
```

# Serve output:

```
node server.js
```

Running on: http://localhost:5000
