class Button extends Container {
  constructor(options = {}) {
    const text = options.text || 'Button'
    const fontSize = parseInt(options.size) || 48
    const onClick = options.onClick || null
    const type = options.type || 'rounded'
    const warp = options.warp !== undefined ? options.warp : false
    const tintOpacity = options.tintOpacity !== undefined ? options.tintOpacity : 0.2

    super({
      borderRadius: fontSize,
      type: type,
      tintOpacity: tintOpacity
    })

    this.text = text
    this.fontSize = fontSize
    this.onClick = onClick
    this.type = type
    this.warp = warp
    this.parent = null
    this.isNestedGlass = false

    this.element.classList.add('glass-button')
    if (this.type === 'circle') {
      this.element.classList.add('glass-button-circle')
    }
    this.createTextElement()
    this.setupClickHandler()
    this.setSizeFromText()
  }

  setSizeFromText() {
    if (this.type === 'circle') {
      const size = Math.max(this.fontSize, 40)
      this.element.style.width = size + 'px'
      this.element.style.height = size + 'px'
      this.borderRadius = size / 2
    } else if (this.type === 'pill') {
      const textMeasure = Button.measureText(this.text, this.fontSize)
      const padding = 24
      const width = Math.max(textMeasure.width + padding * 2, 60)
      const height = this.fontSize + 20

      this.element.style.width = width + 'px'
      this.element.style.height = height + 'px'
      this.borderRadius = height / 2
    }

    this.updateSizeFromDOM()
  }

  setupAsNestedGlass() {
    if (this.parent && !this.isNestedGlass) {
      this.isNestedGlass = true
      if (this.webglInitialized) {
        this.initWebGL()
      }
    }
  }

  static measureText(text, fontSize) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`
    return ctx.measureText(text)
  }

  createTextElement() {
    this.textElement = document.createElement('div')
    this.textElement.className = 'glass-button-text'
    this.textElement.textContent = this.text
    this.textElement.style.fontSize = this.fontSize + 'px'

    this.element.appendChild(this.textElement)
  }

  setupClickHandler() {
    if (this.onClick && this.element) {
      this.element.addEventListener('click', e => {
        e.preventDefault()
        this.onClick(this.text)
      })
    }
  }

  initWebGL() {
    if (!Container.pageSnapshot || !this.gl) return

    if (this.parent && this.isNestedGlass) {
      this.initNestedGlass()
    } else {
      super.initWebGL()
    }
  }

  initNestedGlass() {
    if (!this.parent.webglInitialized) {
      setTimeout(() => this.initNestedGlass(), 100)
      return
    }

    this.setupDynamicNestedShader()
    this.webglInitialized = true
  }

  setupDynamicNestedShader() {
    const gl = this.gl

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;

      void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texcoord = a_texcoord;
      }
    `

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform vec2 u_textureSize;
      uniform float u_blurRadius;
      uniform float u_borderRadius;
      uniform vec2 u_buttonPosition;
      uniform vec2 u_containerPosition;
      uniform vec2 u_containerSize;
      uniform float u_warp;
      uniform float u_edgeIntensity;
      uniform float u_rimIntensity;
      uniform float u_baseIntensity;
      uniform float u_edgeDistance;
      uniform float u_rimDistance;
      uniform float u_baseDistance;
      uniform float u_cornerBoost;
      uniform float u_rippleEffect;
      uniform float u_tintOpacity;
      varying vec2 v_texcoord;

      float roundedRectDistance(vec2 coord, vec2 size, float radius) {
        vec2 center = size * 0.5;
        vec2 pixelCoord = coord * size;
        vec2 toCorner = abs(pixelCoord - center) - (center - radius);
        float outsideCorner = length(max(toCorner, 0.0));
        float insideCorner = min(max(toCorner.x, toCorner.y), 0.0);
        return (outsideCorner + insideCorner - radius);
      }

      float circleDistance(vec2 coord, vec2 size, float radius) {
        vec2 center = vec2(0.5, 0.5);
        vec2 pixelCoord = coord * size;
        vec2 centerPixel = center * size;
        float distFromCenter = length(pixelCoord - centerPixel);
        return distFromCenter - radius;
      }

      bool isPill(vec2 size, float radius) {
        float heightRatioDiff = abs(radius - size.y * 0.5);
        bool radiusMatchesHeight = heightRatioDiff < 2.0;
        bool isWiderThanTall = size.x > size.y + 4.0;
        return radiusMatchesHeight && isWiderThanTall;
      }

      bool isCircle(vec2 size, float radius) {
        float minDim = min(size.x, size.y);
        bool radiusMatchesMinDim = abs(radius - minDim * 0.5) < 1.0;
        bool isRoughlySquare = abs(size.x - size.y) < 4.0;
        return radiusMatchesMinDim && isRoughlySquare;
      }

      float pillDistance(vec2 coord, vec2 size, float radius) {
        vec2 center = size * 0.5;
        vec2 pixelCoord = coord * size;

        vec2 capsuleStart = vec2(radius, center.y);
        vec2 capsuleEnd = vec2(size.x - radius, center.y);

        vec2 capsuleAxis = capsuleEnd - capsuleStart;
        float capsuleLength = length(capsuleAxis);

        if (capsuleLength > 0.0) {
          vec2 toPoint = pixelCoord - capsuleStart;
          float t = clamp(dot(toPoint, capsuleAxis) / dot(capsuleAxis, capsuleAxis), 0.0, 1.0);
          vec2 closestPointOnAxis = capsuleStart + t * capsuleAxis;
          vec2 normalDir = pixelCoord - closestPointOnAxis;
          return length(normalDir) - radius;
        } else {
          return length(pixelCoord - center) - radius;
        }
      }

      void main() {
        vec2 coord = v_texcoord;

        vec2 buttonTopLeft = (u_buttonPosition - u_resolution * 0.5) / u_containerSize;
        vec2 containerTopLeft = (u_containerPosition - u_containerSize * 0.5) / u_containerSize;

        vec2 buttonRelativePos = buttonTopLeft - containerTopLeft;

        vec2 buttonPixel = coord * u_resolution;

        vec2 containerPixel = buttonRelativePos + buttonPixel;

        vec2 baseTextureCoord = containerPixel / u_containerSize;

        float distFromEdgeShape;
        vec2 shapeNormal;

        if (isPill(u_resolution, u_borderRadius)) {
          distFromEdgeShape = -pillDistance(coord, u_resolution, u_borderRadius);

          vec2 center = vec2(0.5, 0.5);
          vec2 pixelCoord = coord * u_resolution;
          vec2 capsuleStart = vec2(u_borderRadius, center.y * u_resolution.y);
          vec2 capsuleEnd = vec2(u_resolution.x - u_borderRadius, center.y * u_resolution.y);
          vec2 capsuleAxis = capsuleEnd - capsuleStart;
          float capsuleLength = length(capsuleAxis);

          if (capsuleLength > 0.0) {
            vec2 toPoint = pixelCoord - capsuleStart;
            float t = clamp(dot(toPoint, capsuleAxis) / dot(capsuleAxis, capsuleAxis), 0.0, 1.0);
            vec2 closestPointOnAxis = capsuleStart + t * capsuleAxis;
            vec2 normalDir = pixelCoord - closestPointOnAxis;
            shapeNormal = length(normalDir) > 0.0 ? normalize(normalDir) : vec2(0.0, 1.0);
          } else {
            shapeNormal = normalize(coord - center);
          }
        } else if (isCircle(u_resolution, u_borderRadius)) {
          distFromEdgeShape = -circleDistance(coord, u_resolution, u_borderRadius);
          vec2 center = vec2(0.5, 0.5);
          shapeNormal = normalize(coord - center);
        } else {
          distFromEdgeShape = -roundedRectDistance(coord, u_resolution, u_borderRadius);
          vec2 center = vec2(0.5, 0.5);
          shapeNormal = normalize(coord - center);
        }
        distFromEdgeShape = max(distFromEdgeShape, 0.0);

        float distFromEdge = distFromEdgeShape / min(u_resolution.x, u_resolution.y);

        float normalizedDistance = distFromEdge * min(u_resolution.x, u_resolution.y);
        float baseIntensity = 1.0 - exp(-normalizedDistance * u_baseDistance);
        float edgeIntensity = exp(-normalizedDistance * u_edgeDistance);
        float rimIntensity = exp(-normalizedDistance * u_rimDistance);

        vec2 baseRefraction = shapeNormal * u_baseIntensity * baseIntensity;
        vec2 edgeRefraction = shapeNormal * u_edgeIntensity * edgeIntensity;

        float distFromLeft = coord.x;
        float distFromRight = 1.0 - coord.x;
        float distFromTop = coord.y;
        float distFromBottom = 1.0 - coord.y;
        float cornerDistance = max(distFromLeft, distFromRight) + max(distFromTop, distFromBottom);
        float cornerNormalized = cornerDistance * min(u_resolution.x, u_resolution.y);

        float cornerBoost = exp(-cornerNormalized * 0.3) * u_cornerBoost;
        vec2 cornerRefraction = shapeNormal * cornerBoost;

        vec2 perpendicular = vec2(-shapeNormal.y, shapeNormal.x);
        float rippleEffect = sin(distFromEdge * 30.0) * u_rippleEffect * rimIntensity;
        vec2 textureRefraction = perpendicular * rippleEffect;

        vec2 totalRefraction = baseRefraction + cornerRefraction + textureRefraction;
        vec2 textureCoord = baseTextureCoord + totalRefraction;

        vec4 color = vec4(0.0);
        vec2 texelSize = 1.0 / u_containerSize;
        float sigma = u_blurRadius / 3.0;

        float totalWeight = 0.0;

        for(float i = -4.0; i <= 4.0; i += 1.0) {
          for(float j = -4.0; j <= 4.0; j += 1.0) {
            float distance = length(vec2(i, j));
            if(distance > 4.0) continue;

            float weight = exp(-(distance * distance) / (2.0 * sigma * sigma));

            vec2 offset = vec2(i, j) * texelSize * sigma;
            color += texture2D(u_image, textureCoord + offset) * weight;
            totalWeight += weight;
          }
        }

        color /= totalWeight;

        float gradientPosition = coord.y;
        vec3 topTint = vec3(1.0, 1.0, 1.0);
        vec3 bottomTint = vec3(0.7, 0.7, 0.7);
        vec3 gradientTint = mix(topTint, bottomTint, gradientPosition);
        vec3 tintedColor = mix(color.rgb, gradientTint, u_tintOpacity * 0.7);
        color = vec4(tintedColor, color.a);

        float maskDistance;
        if (isPill(u_resolution, u_borderRadius)) {
          maskDistance = pillDistance(coord, u_resolution, u_borderRadius);
        } else if (isCircle(u_resolution, u_borderRadius)) {
          maskDistance = circleDistance(coord, u_resolution, u_borderRadius);
        } else {
          maskDistance = roundedRectDistance(coord, u_resolution, u_borderRadius);
        }
        float mask = 1.0 - smoothstep(-1.0, 1.0, maskDistance);

        gl_FragColor = vec4(color.rgb, mask);
      }
    `

    const program = this.createProgram(gl, vsSource, fsSource)
    if (!program) return

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

    const texcoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'a_position')
    const texcoordLoc = gl.getAttribLocation(program, 'a_texcoord')
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const textureSizeLoc = gl.getUniformLocation(program, 'u_textureSize')
    const blurRadiusLoc = gl.getUniformLocation(program, 'u_blurRadius')
    const borderRadiusLoc = gl.getUniformLocation(program, 'u_borderRadius')
    const buttonPositionLoc = gl.getUniformLocation(program, 'u_buttonPosition')
    const containerPositionLoc = gl.getUniformLocation(program, 'u_containerPosition')
    const containerSizeLoc = gl.getUniformLocation(program, 'u_containerSize')
    const warpLoc = gl.getUniformLocation(program, 'u_warp')
    const edgeIntensityLoc = gl.getUniformLocation(program, 'u_edgeIntensity')
    const rimIntensityLoc = gl.getUniformLocation(program, 'u_rimIntensity')
    const baseIntensityLoc = gl.getUniformLocation(program, 'u_baseIntensity')
    const edgeDistanceLoc = gl.getUniformLocation(program, 'u_edgeDistance')
    const rimDistanceLoc = gl.getUniformLocation(program, 'u_rimDistance')
    const baseDistanceLoc = gl.getUniformLocation(program, 'u_baseDistance')
    const cornerBoostLoc = gl.getUniformLocation(program, 'u_cornerBoost')
    const rippleEffectLoc = gl.getUniformLocation(program, 'u_rippleEffect')
    const tintOpacityLoc = gl.getUniformLocation(program, 'u_tintOpacity')
    const imageLoc = gl.getUniformLocation(program, 'u_image')

    const containerCanvas = this.parent.canvas
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, containerCanvas.width, containerCanvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    this.gl_refs = {
      gl,
      texture,
      positionLoc,
      texcoordLoc,
      resolutionLoc,
      textureSizeLoc,
      blurRadiusLoc,
      borderRadiusLoc,
      buttonPositionLoc,
      containerPositionLoc,
      containerSizeLoc,
      warpLoc,
      edgeIntensityLoc,
      rimIntensityLoc,
      baseIntensityLoc,
      edgeDistanceLoc,
      rimDistanceLoc,
      baseDistanceLoc,
      cornerBoostLoc,
      rippleEffectLoc,
      tintOpacityLoc,
      imageLoc,
      positionBuffer,
      texcoordBuffer
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.enableVertexAttribArray(texcoordLoc)
    gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(resolutionLoc, this.canvas.width, this.canvas.height)
    gl.uniform2f(textureSizeLoc, containerCanvas.width, containerCanvas.height)
    gl.uniform1f(blurRadiusLoc, window.glassControls?.blurRadius || 2.0)
    gl.uniform1f(borderRadiusLoc, this.borderRadius)
    gl.uniform1f(warpLoc, this.warp ? 1.0 : 0.0)
    gl.uniform1f(edgeIntensityLoc, window.glassControls?.edgeIntensity || 0.01)
    gl.uniform1f(rimIntensityLoc, window.glassControls?.rimIntensity || 0.05)
    gl.uniform1f(baseIntensityLoc, window.glassControls?.baseIntensity || 0.01)
    gl.uniform1f(edgeDistanceLoc, window.glassControls?.edgeDistance || 0.15)
    gl.uniform1f(rimDistanceLoc, window.glassControls?.rimDistance || 0.8)
    gl.uniform1f(baseDistanceLoc, window.glassControls?.baseDistance || 0.1)
    gl.uniform1f(cornerBoostLoc, window.glassControls?.cornerBoost || 0.02)
    gl.uniform1f(rippleEffectLoc, window.glassControls?.rippleEffect || 0.1)
    gl.uniform1f(tintOpacityLoc, this.tintOpacity)

    const buttonPosition = this.getPosition()
    const containerPosition = this.parent.getPosition()
    gl.uniform2f(buttonPositionLoc, buttonPosition.x, buttonPosition.y)
    gl.uniform2f(containerPositionLoc, containerPosition.x, containerPosition.y)
    gl.uniform2f(containerSizeLoc, this.parent.width, this.parent.height)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(imageLoc, 0)

    this.startNestedRenderLoop()
  }

  startNestedRenderLoop() {
    const render = () => {
      if (!this.gl_refs.gl || !this.parent) return

      const gl = this.gl_refs.gl

      const containerCanvas = this.parent.canvas
      gl.bindTexture(gl.TEXTURE_2D, this.gl_refs.texture)
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, containerCanvas)

      gl.clear(gl.COLOR_BUFFER_BIT)

      const buttonPosition = this.getPosition()
      const containerPosition = this.parent.getPosition()
      gl.uniform2f(this.gl_refs.buttonPositionLoc, buttonPosition.x, buttonPosition.y)
      gl.uniform2f(this.gl_refs.containerPositionLoc, containerPosition.x, containerPosition.y)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const animationLoop = () => {
      render()
      requestAnimationFrame(animationLoop)
    }

    animationLoop()
    this.render = render
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Button
}
