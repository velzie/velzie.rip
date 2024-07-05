precision highp float;

varying vec2 texCoords;
uniform sampler2D textureSampler;
uniform sampler2D randomSampler;

uniform float uTime;
uniform float uTime2;

uniform float uThreshold;


  // void main() {
  //   vec2 uv = vec2(texCoords.x, texCoords.y - mod(uTime2, 0.15) );
  //
  //   vec4 color = texture2D(textureSampler, uv);
  //
  //   // create noise
  //   float random = fract(sin(dot(uv, vec2(12.9898,78.233)) + uTime) * 43758.5453);
  //   // pass through gaussian filter
  //   float noiser = texture2D(textureSampler, uv + vec2(random * 0.01, random * 0.01)).r;
  //   float noiseb = texture2D(textureSampler, uv - vec2(random * 0.01, random * 0.01)).r;
  //
  //   
  //   gl_FragColor = vec4(color.r + noiser, noiseb, noiseb + color.b, 1.0);
  // }






float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 boxMuller(vec2 uv) {
    float u = rand(uv);
    float v = rand(uv + vec2(1.0, 1.0));
    float r = sqrt(-2.0 * log(u));
    float theta = 2.0 * 3.14159265358979323846 * v;
    return vec2(r * cos(theta), r * sin(theta));
}


// Simplex noise function from IQ
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i); 
    vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec4 color = texture2D(textureSampler, texCoords);
  float average = (color.r + color.g + color.b) / 3.0;


  float roundBy = 900.0;

  float noise = 0.0;
  float amplitude = 0.1;

  vec3 coord = vec3(texCoords.xy * 15.0, uTime2);


  for (int i = 0; i < 5; i++) {
    noise += snoise(coord) * amplitude;
    coord *= 2.0;
    amplitude *= 2.0;
  }

  float random = rand(vec2(texCoords.x, texCoords.y + uTime)) * 2.0 - 1.0;
  float threshold = 0.450;

  threshold -= random / 8.0;



  // gl_FragColor = vec4(random, random, random, 1.0);
  if (average > threshold && noise > 0.8) {
    float f = 1.0 - (average - threshold);
    gl_FragColor = vec4(1.0, 0.0, f, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }

    
    vec2 uv = vec2(texCoords.x, texCoords.y );
  //   // create noise
    float random2 = fract(sin(dot(uv, vec2(12.9898,78.233)) + uTime) * 43758.5453);
  // //   // pass through gaussian filter
    vec4 noise2 = texture2D(textureSampler, uv + vec2(random2 * 0.015, random2 * 0.015));

    float avg = (noise2.r + noise2.g + noise2.b) / 3.0;

    if (avg > 0.8) {
        if (random2 > 0.9) {
            avg /= 2.0;
            gl_FragColor = vec4(0.3 * avg, 0.2 * avg, 0.3 * avg,1.0);
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0,1.0);
        }
    }

}
