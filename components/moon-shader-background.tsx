"use client"

import { useRef, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const moonVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const moonFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform vec3 uShadowColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // Improved noise functions for realistic crater texture
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  float craterNoise(vec3 p) {
    float n = 0.0;
    n += 0.5 * snoise(p * 2.0);
    n += 0.25 * snoise(p * 4.0);
    n += 0.125 * snoise(p * 8.0);
    n += 0.0625 * snoise(p * 16.0);
    return n;
  }
  
  void main() {
    // Use world position for consistent crater placement
    vec3 noisePos = vPosition * 1.5;
    
    // Multi-layered crater texture
    float largeCraters = craterNoise(noisePos * 0.8);
    float mediumCraters = craterNoise(noisePos * 2.0 + vec3(100.0));
    float smallCraters = craterNoise(noisePos * 5.0 + vec3(200.0));
    
    float craterDetail = largeCraters * 0.5 + mediumCraters * 0.3 + smallCraters * 0.2;
    
    // Dramatic lighting from the right side
    vec3 lightDir = normalize(vec3(1.0, 0.3, 0.5));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Terminator effect (sharp shadow edge)
    float terminator = smoothstep(-0.1, 0.3, dot(vNormal, lightDir));
    
    // Fresnel for atmospheric rim glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);
    
    // Base moon color with crater shadows
    vec3 baseColor = uColor;
    vec3 craterColor = baseColor * (0.6 + craterDetail * 0.4);
    
    // Apply dramatic lighting
    vec3 litColor = craterColor * (0.08 + diff * 0.92);
    vec3 shadowColor = uShadowColor * 0.3;
    
    vec3 surfaceColor = mix(shadowColor, litColor, terminator);
    
    // Add ethereal blue rim glow
    vec3 rimGlow = uGlowColor * fresnel * 2.0;
    
    vec3 finalColor = surfaceColor + rimGlow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const glowFragmentShader = `
  uniform float uTime;
  uniform vec3 uGlowColor;
  uniform float uIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
    
    // Subtle breathing effect
    float pulse = sin(uTime * 0.3) * 0.08 + 0.92;
    
    vec3 glow = uGlowColor * fresnel * uIntensity * pulse;
    float alpha = fresnel * 0.7 * pulse;
    
    gl_FragColor = vec4(glow, alpha);
  }
`

const starsVertexShader = `
  attribute float size;
  attribute float brightness;
  
  varying float vBrightness;
  
  void main() {
    vBrightness = brightness;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const starsFragmentShader = `
  uniform float uTime;
  varying float vBrightness;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Softer star edges
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);
    
    // Gentle twinkling
    float twinkle = sin(uTime * (1.5 + vBrightness * 2.0) + vBrightness * 50.0) * 0.2 + 0.8;
    
    // Slight blue-white tint
    vec3 color = vec3(0.85, 0.9, 1.0) * vBrightness * twinkle;
    
    gl_FragColor = vec4(color, alpha * vBrightness * twinkle * 0.8);
  }
`

const dustVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float phase;
  
  uniform float uTime;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = customColor;
    
    // Gentle floating motion
    vec3 pos = position;
    pos.y += sin(uTime * 0.15 + phase) * 0.8;
    pos.x += cos(uTime * 0.1 + phase * 1.5) * 0.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (180.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = sin(uTime * 0.3 + phase) * 0.25 + 0.75;
  }
`

const dustFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha * 0.4;
    
    gl_FragColor = vec4(vColor, alpha);
  }
`

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const moonUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#d4d0c8") },
      uGlowColor: { value: new THREE.Color("#60a5fa") },
      uShadowColor: { value: new THREE.Color("#1e293b") },
    }),
    [],
  )

  const glowUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGlowColor: { value: new THREE.Color("#3b82f6") },
      uIntensity: { value: 1.5 },
    }),
    [],
  )

  useFrame((state) => {
    const time = state.clock.elapsedTime
    moonUniforms.uTime.value = time
    glowUniforms.uTime.value = time

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.02
    }
  })

  return (
    <group position={[4, 3, -8]}>
      {/* Main moon sphere - larger size */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 128, 128]} />
        <shaderMaterial vertexShader={moonVertexShader} fragmentShader={moonFragmentShader} uniforms={moonUniforms} />
      </mesh>

      {/* Inner glow layer 
      <mesh ref={glowRef} scale={1.08}>
        <sphereGeometry args={[4, 64, 64]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>*/}

      {/* Outer atmospheric glow 
      <mesh scale={1.25}>
        <sphereGeometry args={[4, 64, 64]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uGlowColor: { value: new THREE.Color("#60a5fa") },
            uIntensity: { value: 0.6 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>*/}

      {/* Distant halo 
      <mesh scale={1.5}>
        <sphereGeometry args={[4, 32, 32]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uGlowColor: { value: new THREE.Color("#3b82f6") },
            uIntensity: { value: 0.25 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>*/}
    </group>
  )
}

function Stars() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, sizes, brightnesses } = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const brightnesses = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 40 + Math.random() * 60

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      sizes[i] = Math.random() * 1.5 + 0.3
      brightnesses[i] = Math.random() * 0.4 + 0.3
    }

    return { positions, sizes, brightnesses }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-brightness" count={brightnesses.length} array={brightnesses} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={starsVertexShader}
        fragmentShader={starsFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function CosmicDust() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, sizes, colors, phases } = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const phases = new Float32Array(count)

    const colorPalette = [
      new THREE.Color("#3b82f6"),
      new THREE.Color("#60a5fa"),
      new THREE.Color("#93c5fd"),
      new THREE.Color("#1d4ed8"),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25 - 15

      sizes[i] = Math.random() * 2.5 + 0.8
      phases[i] = Math.random() * Math.PI * 2

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, sizes, colors, phases }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-customColor" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-phase" count={phases.length} array={phases} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVertexShader}
        fragmentShader={dustFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Line>(null)

  const startTime = useMemo(() => Math.random() * 120, [])
  const startPos = useMemo(
    () => ({
      x: (Math.random() - 0.3) * 25,
      y: 12 + Math.random() * 8,
      z: -15 - Math.random() * 15,
    }),
    [],
  )

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const cycleTime = (time + startTime) % 12

    if (meshRef.current) {
      if (cycleTime < 2) {
        meshRef.current.visible = true
        const progress = cycleTime / 2
        meshRef.current.position.x = startPos.x + progress * 25
        meshRef.current.position.y = startPos.y - progress * 20
        meshRef.current.position.z = startPos.z

        const material = meshRef.current.material as THREE.MeshBasicMaterial
        material.opacity = Math.sin(progress * Math.PI)
      } else {
        meshRef.current.visible = false
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={1} />
    </mesh>
  )
}

function Scene() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 12)
  }, [camera])

  useFrame((state) => {
    // Very subtle camera sway
    const time = state.clock.elapsedTime
    camera.position.x = Math.sin(time * 0.05) * 0.3
    camera.position.y = Math.cos(time * 0.04) * 0.2
  })

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 30, 100]} />

      <Moon />
      <Stars />
      <CosmicDust />

      {[...Array(3)].map((_, i) => (
        <ShootingStar key={i} />
      ))}
    </>
  )
}

export function MoonShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 12], fov: 55 }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <Scene />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/50 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
