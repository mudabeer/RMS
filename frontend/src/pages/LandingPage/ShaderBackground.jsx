import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    v_texCoord = position * 0.5 + 0.5;
  }
`;

const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);

    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
      + (c - a) * u.y * (1.0 - u.x)
      + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 p = uv * 2.0 - 1.0;

    p.x *= u_resolution.x / u_resolution.y;

    float n1 = noise(uv * 3.0 + u_time * 0.1);
    float n2 = noise(uv * 5.0 - u_time * 0.15);

    // RMS palette
    vec3 color1 = vec3(0.976, 0.976, 1.0);
    vec3 color2 = vec3(0.941, 0.953, 1.0);
    vec3 accent = vec3(0.051, 0.58, 0.533);

    vec3 color = mix(color1, color2, n1);
    color = mix(color, accent, n2 * 0.04);

    // Subtle grid effect
    vec2 grid = fract(uv * 20.0);

    float gridLine =
      smoothstep(0.0, 0.05, grid.x) *
      smoothstep(0.0, 0.05, grid.y);

    color = mix(color * 0.98, color, gridLine);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.error("WebGL is not supported");
      return;
    }

    function createShader(type, source) {
      const shader = gl.createShader(type);

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
      }

      return shader;
    }

    const vertexShader = createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );

    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen rectangle made from two triangles
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,

      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ];

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(
      program,
      "position",
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
      positionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );

    const timeLocation = gl.getUniformLocation(program, "u_time");

    const resolutionLocation = gl.getUniformLocation(
      program,
      "u_resolution",
    );

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }

    // Set initial canvas size
    resizeCanvas();

    // Update canvas when window size changes
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId;

    function render(time) {
      const timeInSeconds = time * 0.001;

      gl.uniform1f(timeLocation, timeInSeconds);

      gl.uniform2f(
        resolutionLocation,
        canvas.width,
        canvas.height,
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    // Cleanup when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener(
        "resize",
        resizeCanvas,
      );

      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default ShaderBackground;
