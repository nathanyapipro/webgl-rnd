#include <GLES2/gl2.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <string.h>
#include <assert.h>
#include "webgl.h"
#include "utils.cpp"

static EMSCRIPTEN_WEBGL_CONTEXT_HANDLE glContext;
static int canvasHeight;
static int canvasWidth;
static GLuint renderBuffer;
static GLuint frameBuffer;
static GLuint objectProgram;
static GLuint objectVertexShader;
static GLuint objectFragmentShader;
static GLuint pickingProgram;
static GLuint pickingTexture;
static GLuint pickingVertexShader;
static GLuint pickingFragmentShader;
static GLint positionLocation;
static GLint resolutionLocation;
static GLint colorLocation;
static GLint matrixLocation;
static GLint idLocation;
static GLuint positionBuffer;
GLfloat translation[2] = {200, 200};
GLfloat rotation[2] = {0, 1};
GLfloat scale[2] = {100, 100};

struct objectUniforms
{
  GLfloat u_color[4];
  GLfloat u_matrix[9];
  GLfloat u_id[4];
  GLfloat translation[2];
  GLfloat rotation[2];
  GLfloat scale[2];
};
struct object
{
  objectUniforms uniforms;
};

struct objectBufferInfo
{
  GLsizei numElements;
  GLfloat vertices[200];
  GLenum usage;
};

objectBufferInfo rectangleBufferInfo = {
    .numElements = 12 * 4,
    .vertices =
        {1,
         0,
         0,
         0,
         1,
         1,
         1,
         1,
         0,
         0,
         0,
         1},
    .usage = GL_STATIC_DRAW,
};

struct objectToDraw
{
  GLuint programInfo;
  objectBufferInfo bufferInfo;
  objectUniforms *uniforms;
};

object objects[3];
objectToDraw objectsToDraw[3];

static GLuint
compile_shader(GLenum shaderType, const char *src)
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

void setBufferAndAttributes(GLuint program, objectBufferInfo objectBuffer)
{
  // Load the vertex data
  glEnableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  glBindBuffer(GL_ARRAY_BUFFER, positionBuffer);

  glVertexAttribPointer(
      positionLocation, 2, GL_FLOAT, false, 0, 0);

  glUniform2f(resolutionLocation, canvasWidth, canvasHeight);
  glBufferData(
      GL_ARRAY_BUFFER,
      objectBuffer.numElements,
      objectBuffer.vertices,
      objectBuffer.usage);
}

void setUniforms(GLuint program, objectUniforms uniforms)
{
  glUniform4f(colorLocation, uniforms.u_color[0], uniforms.u_color[1], uniforms.u_color[2], uniforms.u_color[3]);

  // Set translation
  float partial_matrix[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
  float matrix[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
  float trans_matrix[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
  float rot_matrix[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
  float scale_matrix[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
  matrix_translation(uniforms.translation[0], uniforms.translation[1], trans_matrix);
  matrix_rotation(uniforms.rotation[0], uniforms.rotation[1], rot_matrix);
  matrix_scaling(uniforms.scale[0], uniforms.scale[1], scale_matrix);

  // Multiply the matrices.
  matrix_multiply(trans_matrix, rot_matrix, matrix);
  matrix_multiply(matrix, scale_matrix, matrix);

  glUniformMatrix3fv(matrixLocation, 1, false, matrix);
}

//Shaders
static const char vertex_shader_2d[] =
    " attribute vec2 a_position;"

    "uniform vec2 u_resolution;"
    "uniform mat3 u_matrix;"

    "void main() {"
    // Multiply the position by the matrix.
    "vec2 position = (u_matrix * vec3(a_position, 1)).xy;"

    // convert the position from pixels to 0.0 to 1.0
    "vec2 zeroToOne = position / u_resolution;"

    // convert from 0->1 to 0->2
    "vec2 zeroToTwo = zeroToOne * 2.0;"

    // convert from 0->2 to -1->+1 (clipspace)
    "vec2 clipSpace = zeroToTwo - 1.0;"
    "gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);"
    "}";

static const char fragment_shader_2d[] =
    "precision mediump float;"
    "uniform vec4 u_color;"

    "void main() {"
    " gl_FragColor = u_color;"
    "}";

static const char pick_vertex_shader[] =
    "attribute vec4 a_position;"

    "uniform mat4 u_matrix;"

    "void main() {"
    // Multiply the position by the matrix.
    "gl_Position = u_matrix * a_position;"
    "}";

static const char pick_fragment_shader[] =
    "precision mediump float;"
    "uniform vec4 u_id;"
    "void main()"
    "{"
    "gl_FragColor = u_id;"
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

  //Object Program
  objectVertexShader = compile_shader(GL_VERTEX_SHADER, vertex_shader_2d);
  objectFragmentShader = compile_shader(GL_FRAGMENT_SHADER, fragment_shader_2d);
  objectProgram = create_program(objectVertexShader, objectFragmentShader);

  // Picking Program
  pickingVertexShader = compile_shader(GL_VERTEX_SHADER, pick_vertex_shader);
  pickingFragmentShader = compile_shader(GL_FRAGMENT_SHADER, pick_fragment_shader);
  pickingProgram = create_program(pickingVertexShader, pickingFragmentShader);

  positionLocation = glGetAttribLocation(objectProgram, "a_position");
  resolutionLocation = glGetUniformLocation(objectProgram, "u_resolution");
  colorLocation = glGetUniformLocation(objectProgram, "u_color");
  matrixLocation = glGetUniformLocation(
      objectProgram, "u_matrix");
  idLocation = glGetUniformLocation(
      objectProgram, "u_id");

  glGenBuffers(1, &positionBuffer);
  glBindBuffer(GL_ARRAY_BUFFER, positionBuffer);

  glGenTextures(1, &pickingTexture);
  glBindTexture(GL_TEXTURE_2D, pickingTexture);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA,
               canvasWidth, canvasHeight, 0,
               GL_RGBA, GL_UNSIGNED_BYTE, NULL);

  // set the filtering so we don't need mips
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

  // Create and bind the framebuffer
  glGenFramebuffers(1, &frameBuffer);
  glBindFramebuffer(GL_FRAMEBUFFER, frameBuffer);

  // attach the texture as the first color attachment
  glFramebufferTexture2D(
      GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, pickingTexture, 0);

  for (int i = 0; i < 3; i++)
  {
    int id = i + 1;
    objects[i] = {
        .uniforms = {
            .u_color = {static_cast<GLfloat>(rand() % 255 / 255.0), static_cast<GLfloat>(rand() % 255 / 255.0), static_cast<GLfloat>(rand() % 255 / 255.0), 1},
            .u_matrix = {1, 0, 0, 0, 1, 0, 0, 0, 1},
            .u_id = {
                static_cast<GLfloat>(((id >> 0) & 255) / 255),
                static_cast<GLfloat>(((id >> 8) & 255) / 255),
                static_cast<GLfloat>(((id >> 16) & 255) / 255),
                static_cast<GLfloat>(((id >> 24) & 255) / 255),
            },
            .translation = {static_cast<GLfloat>(rand() % 400), static_cast<GLfloat>(rand() % 400)},
            .rotation = {0, 1},
            .scale = {static_cast<GLfloat>(rand() % 300), static_cast<GLfloat>(rand() % 300)},
        },
    };
    objectsToDraw[i] = {
        .programInfo = objectProgram,
        .bufferInfo = rectangleBufferInfo,
        .uniforms = &objects[i].uniforms,
    };
  }

  draw_scene();
}

void draw_objects(GLuint overrideProgram = NULL)
{

  for (int i = 0; i < 3; i++)
  {
    GLuint program = objectsToDraw[i].programInfo;
    if (overrideProgram)
    {
      program = overrideProgram;
    }
    glUseProgram(program);
    setBufferAndAttributes(program, objectsToDraw[i].bufferInfo);
    setUniforms(program, *(objectsToDraw[i].uniforms));
    glDrawArrays(GL_TRIANGLES, 0, 6);
  };
}

void draw_scene()
{
  printf("DRAW SCENE\n");

  // ------ Draw the objects to the texture --------

  glBindFramebuffer(GL_FRAMEBUFFER, frameBuffer);
  glViewport(0, 0, canvasWidth, canvasHeight);

  glEnable(GL_CULL_FACE);
  glEnable(GL_DEPTH_TEST);

  // Clear the canvas AND the depth buffer.
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  draw_objects(pickingProgram);

  // ------ Draw the objects to the canvas

  glBindFramebuffer(GL_FRAMEBUFFER, NULL);
  glViewport(0, 0, canvasWidth, canvasHeight);

  draw_objects();
}

void update_translation(int x, int y)
{
  objects[0].uniforms.translation[0] = x;
  objects[0].uniforms.translation[1] = y;
  draw_scene();
}

void update_rotation(int angle)
{
  objects[0].uniforms.rotation[0] = sin(angle * PI / 180.0);
  objects[0].uniforms.rotation[1] = cos(angle * PI / 180.0);
  draw_scene();
}

void update_scale(int x, int y)
{
  objects[0].uniforms.scale[0] = x;
  objects[0].uniforms.scale[1] = y;
  draw_scene();
}

void set_rectangle()
{
  float x1 = 0;
  float x2 = 1;
  float y1 = 0;
  float y2 = 1;
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