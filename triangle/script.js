var getWebGLCanvas = function()
{
  var CANVAS = document.getElementById("webgl_canvas");

  CANVAS.width=window.innerWidth;
  CANVAS.height=window.innerHeight;


  return CANVAS;
};

var getWebGLContext=function(CANVAS){
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }

  return GL;
};

Shader = function(GL){
  this.GL = GL;
  this.vertexShaderSource = null;
  this.fragmentShaderSource = null;
  this.vertexShader;
  this.fragmentShader;
  this.program;

  var readFile = function(fileName) {
    var result;

    $.ajax({
      async: false,
      url: fileName,
      success: function (data) {    
          result = data;
      },
      dataType: 'text'
    });

    return result;
  };

  this.loadShaderFiles = function(vertexShaderFile,fragmentShaderFile) {
    this.vertexShaderSource = readFile(vertexShaderFile);
    this.fragmentShaderSource = readFile(fragmentShaderFile);
  };

  this.compileShaders=function() {
    this.vertexShader = GL.createShader(GL.VERTEX_SHADER);
    this.fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);

    GL.shaderSource(this.vertexShader, this.vertexShaderSource);
    GL.shaderSource(this.fragmentShader, this.fragmentShaderSource);
    GL.compileShader(this.vertexShader);
    GL.compileShader(this.fragmentShader);

    if (!GL.getShaderParameter(this.vertexShader, GL.COMPILE_STATUS)) {
      alert("ERROR IN VERTEX SHADER : " + GL.getShaderInfoLog(this.vertexShader));
    }

    if (!GL.getShaderParameter(this.fragmentShader, GL.COMPILE_STATUS)) {
      alert("ERROR IN FRAGMENT SHADER : " + GL.getShaderInfoLog(this.fragmentShader));
    }
  };

    this.attachAndLinkShaders = function(){
      this.program =GL.createProgram();
      GL.attachShader(this.program, this.vertexShader);
      GL.attachShader(this.program, this.fragmentShader);

      GL.linkProgram(this.program);
    };

}

var main=function() {

  var CANVAS = getWebGLCanvas();

  var GL=getWebGLContext(CANVAS);
  
  
  /*========================= SHADERS ========================= */
  
  var shader = new Shader(GL);
  shader.loadShaderFiles('./vertex_shader.glsl','./fragment_shader.glsl');
  shader.compileShaders();
  shader.attachAndLinkShaders();
  
  var _color = GL.getAttribLocation(shader.program, "color");
  var _position = GL.getAttribLocation(shader.program, "position");

  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_position);

  GL.useProgram(shader.program);


  /*========================= THE TRIANGLE ========================= */
  
  var triangle_vertex=[
    -1,-1, //first summit -> bottom left of the viewport
    0,0,1,
    1,-1, //bottom right of the viewport
    1,1,0,
    1,1,  //top right of the viewport
    1,0,0
  ];

  var TRIANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(triangle_vertex),
    GL.STATIC_DRAW);

  //FACES :
  var triangle_faces = [0,1,2];
  var TRIANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces),
    GL.STATIC_DRAW);



  /*========================= DRAWING ========================= */
  GL.clearColor(0.0, 0.0, 0.0, 0.0);

  var animate=function() {

    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT);

    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);

    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false,4*(2+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(2+3),2*4) ;

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);
    GL.flush();

    window.requestAnimationFrame(animate);
  };

  animate();
};