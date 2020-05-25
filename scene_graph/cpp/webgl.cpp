#include <GLES2/gl2.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <string.h>
#include <assert.h>
#include "webgl.h"

static EMSCRIPTEN_WEBGL_CONTEXT_HANDLE glContext;
static int canvasHeight;
static int canvasWidth;
static GLuint programObject;
static GLuint vertexShader;
static GLuint fragmentShader;
static GLint positionLocation;
static GLint resolutionLocation;
static GLint colorLocation;
static GLint translationLocation;
static GLint rotationLocation;
static GLuint positionBuffer;
GLfloat translation[2] = {50.0, 50.0};
GLfloat rotation[2] = {0, 1};

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

void clear_screen(float r, float g, float b, float a)
{
  glClearColor(r, g, b, a);
  glClear(GL_COLOR_BUFFER_BIT);
}

//Shaders
static const char vertex_shader_2d[] =
    "attribute vec2 a_position;"
    "uniform vec2 u_resolution;"
    "uniform vec2 u_translation;"
    "uniform vec2 u_rotation;"

    "void main() {"
    // Rotate the position
    "vec2 rotatedPosition = vec2("
    "a_position.x * u_rotation.y + a_position.y * u_rotation.x,"
    "a_position.y * u_rotation.y - a_position.x * u_rotation.x);"

    // Add in the translation.
    "vec2 position = rotatedPosition + u_translation;"
    // convert the rectangle points from pixels to 0.0 to 1.0
    " vec2 zeroToOne = position / u_resolution;"
    // convert from 0->1 to 0->2
    " vec2 zeroToTwo = zeroToOne * 2.0;"
    // convert from 0->2 to -1->+1 (clipspace)
    " vec2 clipSpace = zeroToTwo - 1.0;"
    " gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);"
    "}";

static const char fragment_shader_2d[] =
    "precision mediump float;"
    "uniform vec4 u_color;"

    "void main() {"
    " gl_FragColor = u_color;"
    "}";

void webgl_init(int width, int height)
{
  printf("WEB_GL_INIT\n");
  canvasHeight = height;
  canvasWidth = width;
  // double dpr = emscripten_get_device_pixel_ratio();
  emscripten_set_element_css_size("#scene", width, height);
  emscripten_set_canvas_element_size("#scene", width, height);

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

  // Create Context
  glContext = emscripten_webgl_create_context("#scene", &attrs);
  assert(glContext);

  emscripten_webgl_make_context_current(glContext);

  // Compile shaders
  vertexShader = compile_shader(GL_VERTEX_SHADER, vertex_shader_2d);
  fragmentShader = compile_shader(GL_FRAGMENT_SHADER, fragment_shader_2d);

  // Build program
  programObject = create_program(vertexShader, fragmentShader);

  positionLocation = glGetAttribLocation(programObject, "a_position");
  resolutionLocation = glGetUniformLocation(programObject, "u_resolution");
  colorLocation = glGetUniformLocation(programObject, "u_color");
  translationLocation = glGetUniformLocation(
      programObject, "u_translation");
  rotationLocation = glGetUniformLocation(programObject, "u_rotation");

  glGenBuffers(1, &positionBuffer);
  glBindBuffer(GL_ARRAY_BUFFER, positionBuffer);

  draw_scene();
}

void draw_scene()
{
  printf("DRAW SCENE\n");
  glViewport(0, 0, canvasWidth, canvasHeight);

  // Clear the color buffer
  glClearColor(0, 0, 0, 0);
  glClear(GL_COLOR_BUFFER_BIT);

  // Use the program object
  glUseProgram(programObject);

  // Load the vertex data
  glEnableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  glBindBuffer(GL_ARRAY_BUFFER, positionBuffer);

  glVertexAttribPointer(
      positionLocation, 2, GL_FLOAT, false, 0, 0);

  glUniform2f(resolutionLocation, canvasWidth, canvasHeight);

  // Setup a rectangle
  setRectangle(100, 100);

  // Set a random color.
  glUniform4f(colorLocation, float(rand() % 10) / 10.0, float(rand() % 10) / 10.0, float(rand() % 10) / 10.0, 1);

  // Set translation
  glUniform2fv(translationLocation, 1, translation);

  // Set rotation
  glUniform2fv(rotationLocation, 1, rotation);

  // Draw the rectangle.
  glDrawArrays(GL_TRIANGLES, 0, 6);

  // for (int ii = 0; ii < 3; ++ii)
  // {
  //   // Setup a random rectangle
  //   // This will write to positionBuffer because
  //   // its the last thing we bound on the ARRAY_BUFFER
  //   // bind point
  //   setRectangle(
  //       rand() % 500, rand() % 500, rand() % 100, rand() % 100);

  //   // Set a random color.
  //   glUniform4f(colorLocation, float(rand() % 10) / 10.0, float(rand() % 10) / 10.0, float(rand() % 10) / 10.0, 1);

  //   // Draw the rectangle.
  //   glDrawArrays(GL_TRIANGLES, 0, 6);
  // }
}

void update_translation(int x, int y)
{
  translation[0] = x;
  translation[1] = y;
  draw_scene();
}

#define PI 3.14159265

void update_rotation(int angle)
{
  rotation[0] = cos(angle * PI / 180.0);
  rotation[1] = sin(angle * PI / 180.0);
  draw_scene();
}

void setRectangle(float width, float height)
{
  float x1 = -width / 2;
  float x2 = width / 2;
  float y1 = -height / 2;
  float y2 = height / 2;
  GLfloat rectVertices[] = {x1,
                            y1,
                            x2,
                            y1,
                            x1,
                            y2,
                            x1,
                            y2,
                            x2,
                            y1,
                            x2,
                            y2};
  glBufferData(
      GL_ARRAY_BUFFER, 12 * 4,
      rectVertices,
      GL_STATIC_DRAW);
}