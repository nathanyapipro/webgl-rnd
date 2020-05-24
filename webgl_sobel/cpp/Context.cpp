#include <string>
#include <GLES2/gl2.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <string.h>
#include <assert.h>
#include "Context.h"

//Utils
static GLuint compile_shader(GLenum shaderType, const char *src)
{
  GLuint shader = glCreateShader(shaderType);
  glShaderSource(shader, 1, &src, NULL);
  glCompileShader(shader);
  return shader;
}

static GLuint create_program(GLuint vertexShader, GLuint fragmentShader)
{
  GLuint program = glCreateProgram();
  glAttachShader(program, vertexShader);
  glAttachShader(program, fragmentShader);
  glBindAttribLocation(program, 0, "pos");
  glLinkProgram(program);
  glUseProgram(program);
  return program;
}

static GLuint create_texture()
{
  GLuint texture;
  glGenTextures(1, &texture);
  glBindTexture(GL_TEXTURE_2D, texture);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  return texture;
}

//Shaders
static const char vertex_source[] =
    "attribute vec4 position;   "
    "attribute vec2 texCoord;   "
    "varying vec2 v_texCoord;     "
    "void main()                  "
    "{                            "
    "   gl_Position = position; "
    "   v_texCoord = texCoord;  "
    "}                            ";

static const char texture_load_fragment_source[] =
    "precision mediump float;                            "
    "varying vec2 v_texCoord;                            "
    "uniform sampler2D texture;                        "
    "void main()                                         "
    "{                                                   "
    "  gl_FragColor = texture2D( texture, v_texCoord );   "
    "}                                ";

static const char edge_detect_fragment_source[] =
    "precision mediump float;                            "
    "varying vec2 v_texCoord;                            "
    "uniform sampler2D texture;                        "
    "uniform float width;  "
    "uniform float height;  "
    "void main()                                         "
    "{                                                   "
    "  vec4 pixel = texture2D(texture, v_texCoord);              "
    "  vec4 n[9];"

    "  float w = 1.0 / width;"
    "  float h = 1.0 / height;"

    "  n[0] = texture2D(texture, v_texCoord + vec2(0.0, 0.0) );"
    "  n[1] = texture2D(texture, v_texCoord + vec2(w, 0.0) );"
    "  n[2] = texture2D(texture, v_texCoord + vec2(2.0*w, 0.0) );"
    "  n[3] = texture2D(texture, v_texCoord + vec2(0.0*w, h) );"
    "  n[4] = texture2D(texture, v_texCoord + vec2(w, h) );"
    "  n[5] = texture2D(texture, v_texCoord + vec2(2.0*w, h) );"
    "  n[6] = texture2D(texture, v_texCoord + vec2(0.0, 2.0*h) );"
    "  n[7] = texture2D(texture, v_texCoord + vec2(w, 2.0*h) );"
    "  n[8] = texture2D(texture, v_texCoord + vec2(2.0*w, 2.0*h) );"

    "  vec4 sobel_x = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);"
    "  vec4 sobel_y = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);"

    "  float avg_x = (sobel_x.r + sobel_x.g + sobel_x.b) / 3.0;"
    "  float avg_y = (sobel_y.r + sobel_y.g + sobel_y.b) / 3.0;"

    "  sobel_x.r = avg_x;"
    "  sobel_x.g = avg_x;"
    "  sobel_x.b = avg_x;"
    "  sobel_y.r = avg_y;"
    "  sobel_y.g = avg_y;"
    "  sobel_y.b = avg_y;"

    "  vec3 sobel = vec3(sqrt((sobel_x.rgb * sobel_x.rgb) + (sobel_y.rgb * sobel_y.rgb)));"
    "  gl_FragColor = vec4( sobel, 1.0 );   "
    "}                                                   ";

Context::Context(int w, int h, char *id)
{
  width = w;
  height = h;

  // double dpr = emscripten_get_device_pixel_ratio();
  // emscripten_set_element_css_size(id, width / dpr, height / dpr);
  // emscripten_set_canvas_element_size(id, width, height);

  // Context configurations
  // EmscriptenWebGLContextAttributes attrs;
  // attrs.explicitSwapControl = 0;
  // attrs.depth = 1;
  // attrs.stencil = 1;
  // attrs.antialias = 1;
  // attrs.majorVersion = 3;
  // attrs.minorVersion = 0;

  // context = emscripten_webgl_create_context(id, &attrs);
  // emscripten_webgl_make_context_current(context);
  EmscriptenWebGLContextAttributes attrs;
  emscripten_webgl_init_context_attributes(&attrs);
  attrs.explicitSwapControl = 0;
  attrs.depth = 1;
  attrs.stencil = 1;
  attrs.antialias = 1;
  attrs.majorVersion = 3;
  attrs.minorVersion = 0;
#if MAX_WEBGL_VERSION >= 2
  attrs.majorVersion = 2;
#endif
  context = emscripten_webgl_create_context(id, &attrs);
  emscripten_webgl_make_context_current(context);
  assert(context);

  // Compile shaders
  vertexShader = compile_shader(GL_VERTEX_SHADER, vertex_source);
  fragmentShader = compile_shader(GL_FRAGMENT_SHADER, edge_detect_fragment_source);

  // Build program
  programObject = create_program(vertexShader, fragmentShader);

  glBindAttribLocation(programObject, 0, "position");

  glLinkProgram(programObject);
  glValidateProgram(programObject);
}

Context::~Context(void)
{
  emscripten_webgl_destroy_context(context);
}

void Context::run(uint8_t *buffer)
{

  // Make the context current and use the program
  emscripten_webgl_make_context_current(context);
  glUseProgram(programObject);

  GLuint texId;
  GLuint vertexObject;
  GLuint indexObject;

  // Get the attribute/sampler locations
  GLint positionLoc = glGetAttribLocation(programObject, "position");
  GLint texCoordLoc = glGetAttribLocation(programObject, "texCoord");
  GLint textureLoc = glGetUniformLocation(programObject, "texture");

  // For "ERROR :GL_INVALID_OPERATION : glUniform1i: wrong uniform function for type"
  // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glUniform.xhtml
  float widthUniform = glGetUniformLocation(programObject, "width");
  float heightUniform = glGetUniformLocation(programObject, "height");
  glUniform1f(widthUniform, (float)width);
  glUniform1f(heightUniform, (float)height);

  // Generate a texture object
  glGenTextures(1, &texId);
  glUniform1i(textureLoc, 0);

  // Bind it
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, texId);

  // Load the texture from the image buffer
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

  // Vertex data of texture bounds
  GLfloat vVertices[] = {-1.0, 1.0, 0.0, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0,
                         1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0};
  GLushort indices[] = {0, 1, 2, 0, 2, 3};

  glGenBuffers(1, &vertexObject);
  glBindBuffer(GL_ARRAY_BUFFER, vertexObject);
  glBufferData(GL_ARRAY_BUFFER, sizeof(vVertices), vVertices, GL_STATIC_DRAW);

  glGenBuffers(1, &indexObject);
  glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexObject);
  glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

  // Set the viewport
  glViewport(0, 0, width, height);
  glClear(GL_COLOR_BUFFER_BIT);

  // Load and enable the vertex position and texture coordinates
  glVertexAttribPointer(positionLoc, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(GLfloat), 0);
  glVertexAttribPointer(texCoordLoc, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(GLfloat), (GLvoid *)(3 * sizeof(GLfloat)));

  glEnableVertexAttribArray(positionLoc);
  glEnableVertexAttribArray(texCoordLoc);

  // Draw
  glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, 0);
}