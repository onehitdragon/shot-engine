export const EPSILON = 1e-6;
export const Rad2Deg = 180 / Math.PI;
export const Deg2Rad = Math.PI / 180;
/** pi / 360 */
export const PIover360 = Deg2Rad * 0.5;
/** 2 * PI */
export const PI2 = 2 * Math.PI;
/** symetric round */
export function round(value: number){
  return Math.sign(value) * Math.round(Math.abs(value));
}

export class Vec2{
  declare private readonly __brand: 'Vec2';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(2);
  }
  public static FromValues(x: number, y: number){
    const out = new Vec2();
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    return out;
  }
}
// missing forEach, bezier, hermite
export class Vec3{
  declare private readonly __brand: 'Vec3';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(3);
  }
  public static FromValues(x: number, y: number, z: number){
    const out = new Vec3();
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    return out;
  }
  public static Add(out: Vec3, a: Vec3, b: Vec3){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] + bValues[0];
    outValues[1] = aValues[1] + bValues[1];
    outValues[2] = aValues[2] + bValues[2];
    return out;
  }
  public add(b: Vec3){
    return Vec3.Add(this, this, b);
  }
  /** angle between a and b, using dot, 0 -> pi/2 */
  public static Angle(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const bx = bValues[0];
    const by = bValues[1];
    const bz = bValues[2];
    const length = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz));
    if(length < EPSILON) return 0;
    const cos = (ax * bx + ay * by + az * bz) / length;
    return Math.acos(Math.max(-1, Math.min(1, cos)));
  }
  /** angle between a and b, using dot, 0 -> pi/2 */
  public angle(b: Vec3){
    return Vec3.Angle(this, b);
  }
  public static Ceil(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = Math.ceil(aValues[0]);
    outValues[1] = Math.ceil(aValues[1]);
    outValues[2] = Math.ceil(aValues[2]);
    return out;
  }
  public ceil(){
    return Vec3.Ceil(this, this);
  }
  public static Clone(a: Vec3){
    const aValues = a.values;
    const out = new Vec3();
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    return out;
  }
  public clone(){
    return Vec3.Clone(this);
  }
  public static Copy(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    return out;
  }
  public copy(a: Vec3){
    return Vec3.Copy(this, a);
  }
  public static Create(){
    const out = new Vec3();
    const outValues = out.values;
    outValues[0] = 0;
    outValues[1] = 0;
    outValues[2] = 0;
    return out;
  }
  public static Cross(out: Vec3, a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    const ax = aValues[0], ay = aValues[1], az = aValues[2];
    const bx = bValues[0], by = bValues[1], bz = bValues[2];
    const outValues = out.values;
    outValues[0] = ay * bz - az * by;
    outValues[1] = az * bx - ax * bz;
    outValues[2] = ax * by - ay * bx;
    return out;
  }
  /** a = a x b */
  public cross(b: Vec3){
    return Vec3.Cross(this, this, b);
  }
  public static Distance(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    const x = bValues[0] - aValues[0];
    const y = bValues[1] - aValues[1];
    const z = bValues[2] - aValues[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  public distance(b: Vec3){
    return Vec3.Distance(this, b);
  }
  public static Div(out: Vec3, a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] / bValues[0];
    outValues[1] = aValues[1] / bValues[1];
    outValues[2] = aValues[2] / bValues[2];
    return out;
  }
  /** a = a / b */
  public div(b: Vec3){
    return Vec3.Div(this, this, b);
  }
  public static Dot(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] * bValues[0] + aValues[1] * bValues[1] + aValues[2] * bValues[2];
  }
  public dot(b: Vec3){
    return Vec3.Dot(this, b);
  }
  /** approximately equal */
  public static Equals(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    return Math.abs(aValues[0] - bValues[0]) < EPSILON &&
      Math.abs(aValues[1] - bValues[1]) < EPSILON &&
      Math.abs(aValues[2] - bValues[2]) < EPSILON;
  }
  /** approximately equal */
  public equals(b: Vec3){
    return Vec3.Equals(this, b);
  }
  public static ExactEquals(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] === bValues[0] &&
      aValues[1] === bValues[1] &&
      aValues[2] === bValues[2];
  }
  public exactEquals(b: Vec3){
    return Vec3.ExactEquals(this, b);
  }
  public static Inverse(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValue = out.values;
    outValue[0] = 1 / aValues[0];
    outValue[1] = 1 / aValues[1];
    outValue[2] = 1 / aValues[2];
    return out;
  }
  public inverse(){
    return Vec3.Inverse(this, this);
  }
  public static Length(a: Vec3){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    return Math.sqrt(ax * ax + ay * ay + az * az);
  }
  public length(){
    return Vec3.Length(this);
  }
  /** out = tb + (1 - t)a
   * @param t [0,1] -> [a, b]
  */
  public static Lerp(out: Vec3, a: Vec3, b: Vec3, t: number){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = ax + t * (bValues[0] - ax);
    outValues[1] = ay + t * (bValues[1] - ay);
    outValues[2] = az + t * (bValues[2] - az);
    return out;
  }
  public static Max(out: Vec3, a: Vec3, b: Vec3){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = Math.max(aValues[0], bValues[0]);
    outValues[1] = Math.max(aValues[1], bValues[1]);
    outValues[2] = Math.max(aValues[2], bValues[2]);
    return out;
  }
  public static Min(out: Vec3, a: Vec3, b: Vec3){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = Math.min(aValues[0], bValues[0]);
    outValues[1] = Math.min(aValues[1], bValues[1]);
    outValues[2] = Math.min(aValues[2], bValues[2]);
    return out;
  }
  public static Multiply(out: Vec3, a: Vec3, b: Vec3){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] * bValues[0];
    outValues[1] = aValues[1] * bValues[1];
    outValues[2] = aValues[2] * bValues[2];
    return out;
  }
  public multiply(b: Vec3){
    return Vec3.Multiply(this, this, b);
  }
  public static Negate(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = -aValues[0];
    outValues[1] = -aValues[1];
    outValues[2] = -aValues[2];
    return out;
  }
  public negate(){
    return Vec3.Negate(this, this);
  }
  public static Normalize(out: Vec3, a: Vec3){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    let length = ax * ax + ay * ay + az * az;
    if(length > EPSILON){
      length = 1 / Math.sqrt(length);
    }
    const outValues = out.values;
    outValues[0] = ax * length;
    outValues[1] = ay * length;
    outValues[2] = az * length;
    return out;
  }
  public normalize(){
    return Vec3.Normalize(this, this);
  }
  /** random a vector its length = scale, all vector lay on sphere r = scale */
  public static Random(out: Vec3, scale = 1){
    const theta = Math.random() * PI2;
    const z = (Math.random() * 2 - 1) * scale;
    const h = Math.sqrt(Math.max(0, scale * scale - z * z));

    const outValues = out.values;
    outValues[0] = Math.cos(theta) * h;
    outValues[1] = Math.sin(theta) * h;
    outValues[2] = z;

    return out;
  }
  /** rotate vector(ba) around X
   * @param a endpoint
   * @param b startpoint
   */
  public static RotateX(out: Vec3, a: Vec3, b: Vec3, rad: number){
    const aValues = a.values;
    const bValues = b.values;
    const b2 = bValues[1];
    const b3 = bValues[2];
    const y = aValues[1] - b2;
    const z = aValues[2] - b3;
    
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = (y * c - z * s) + b2;
    outValues[2] = (y * s + z * c) + b3;
    
    return out;
  }
  /** rotate vector(ba) around Y
   * @param a endpoint
   * @param b startpoint
   */
  public static RotateY(out: Vec3, a: Vec3, b: Vec3, rad: number){
    const aValues = a.values;
    const bValues = b.values;
    const b1 = bValues[0];
    const b3 = bValues[2];
    const x = aValues[0] - b1;
    const z = aValues[2] - b3;
    
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = (x * c + z * s) + b1;
    outValues[1] = aValues[1];
    outValues[2] = (z * c - x * s) + b3;
    
    return out;
  }
  /** rotate vector(ba) around Z
   * @param a endpoint
   * @param b startpoint
   */
  public static RotateZ(out: Vec3, a: Vec3, b: Vec3, rad: number){
    const aValues = a.values;
    const bValues = b.values;
    const b1 = bValues[0];
    const b2 = bValues[1];
    const x = aValues[0] - b1;
    const y = aValues[1] - b2;
    
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = (x * c - y * s) + b1;
    outValues[1] = (x * s + y * c) + b2;
    outValues[2] = aValues[2];
    
    return out;
  }
  /** symetric round */
  public static Round(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = round(aValues[0]);
    outValues[1] = round(aValues[1]);
    outValues[2] = round(aValues[2]);
    return out;
  }
  /** symetric round */
  public round(){
    return Vec3.Round(this, this);
  }
  public static Scale(out: Vec3, a: Vec3, c: number){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * c;
    outValues[1] = aValues[1] * c;
    outValues[2] = aValues[2] * c;
    return out;
  }
  public scale(c: number){
    return Vec3.Scale(this, this, c);
  }
  /** out = a + b * c */
  public static ScaleAndAdd(out: Vec3, a: Vec3, b: Vec3, c: number){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] + bValues[0] * c;
    outValues[1] = aValues[1] + bValues[1] * c;
    outValues[2] = aValues[2] + bValues[2] * c;
    return out;
  }
  /** a = a + b * c */
  public scaleAndAdd(b: Vec3, c: number){
    return Vec3.ScaleAndAdd(this, this, b, c);
  }
  public static Set(out: Vec3, x: number, y: number, z: number){
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    return out;
  }
  public set(x: number, y: number, z: number){
    return Vec3.Set(this, x, y, z);
  }
  /** a, b should be unit vector 
   * @param t [0,1] -> [a, b]
  */
  public static Slerp(out: Vec3, a: Vec3, b: Vec3, t: number){    
    const w = Math.acos(Math.max(-1, Math.min(1, Vec3.Dot(a, b))));
    const sinw = Math.sin(w);
    let f1 = 1 - t;
    let f2 = t;
    if(sinw > EPSILON){
      f1 = Math.sin((1 - t) * w) / sinw;
      f2 = Math.sin(t * w) / sinw;
    }
    
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = f1 * aValues[0] + f2 * bValues[0];
    outValues[1] = f1 * aValues[1] + f2 * bValues[1];
    outValues[2] = f1 * aValues[2] + f2 * bValues[2];
    return out;
  }
  public static SquaredDistance(a: Vec3, b: Vec3){
    const aValues = a.values;
    const bValues = b.values;
    const x = bValues[0] - aValues[0];
    const y = bValues[1] - aValues[1];
    const z = bValues[2] - aValues[2];
    return x * x + y * y + z * z;
  }
  public squaredDistance(b: Vec3){
    return Vec3.SquaredDistance(this, b);
  }
  public static SquaredLength(a: Vec3){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    return ax * ax + ay * ay + az * az;
  }
  public squaredLength(){
    return Vec3.SquaredLength(this);
  }
  public static String(a: Vec3){
    const aValues = a.values;
    return "vec3("
    + aValues[0] + ", "
    + aValues[1] + ", "
    + aValues[2]
    + ")";
  }
  public string(){
    return Vec3.String(this);
  }
  public static Sub(out: Vec3, a: Vec3, b: Vec3){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] - bValues[0];
    outValues[1] = aValues[1] - bValues[1];
    outValues[2] = aValues[2] - bValues[2];
    return out;
  }
  public sub(b: Vec3){
    return Vec3.Sub(this, this, b);
  }
  public static TransformMat3(out: Vec3, a: Vec3, mat3: Mat3){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const matValues = mat3.values;
    const outValues = out.values;
    outValues[0] = x * matValues[0] + y * matValues[3] + z * matValues[6];
    outValues[1] = x * matValues[1] + y * matValues[4] + z * matValues[7];
    outValues[2] = x * matValues[2] + y * matValues[5] + z * matValues[8];
    return out;
  }
  public transformMat3(mat3: Mat3){
    return Vec3.TransformMat3(this, this, mat3);
  }
  /** assume a.z = 1, divive w after multiply */
  public static TransformMat4(out: Vec3, a: Vec3, mat4: Mat4){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const matValues = mat4.values;
    const outValues = out.values;
    const w = (x * matValues[3] + y * matValues[7] + z * matValues[11] + matValues[15]) || 1;
    outValues[0] = (x * matValues[0] + y * matValues[4] + z * matValues[8] + matValues[12]) / w;
    outValues[1] = (x * matValues[1] + y * matValues[5] + z * matValues[9] + matValues[13]) / w;
    outValues[2] = (x * matValues[2] + y * matValues[6] + z * matValues[10] + matValues[14]) / w;
    return out;
  }
  /** assume a.z = 1, divive w after multiply */
  public transformMat4(mat4: Mat4){
    return Vec3.TransformMat4(this, this, mat4);
  }
  /** out = qvq* */
  public static TransformQuat(out: Vec3, a: Vec3, quat: Quat){
    const quatValues = quat.values;
    const qx = quatValues[0];
    const qy = quatValues[1];
    const qz = quatValues[2];
    const qw = quatValues[3];
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    // 2(q x v)
    let gx = (qy * az - qz * ay) * 2;
    let gy = (qz * ax - qx * az) * 2;
    let gz = (qx * ay - qy * ax) * 2;

    const outValues = out.values;
    outValues[0] = ax + qw * gx + (qy * gz - qz * gy);
    outValues[1] = ay + qw * gy + (qz * gx - qx * gz);
    outValues[2] = az + qw * gz + (qx * gy - qy * gx);
    return out;
  }
  /** v = qvq* */
  public transformQuat(quat: Quat){
    return Vec3.TransformQuat(this, this, quat);
  }
  /** set to zero */
  public static Zero(a: Vec3){
    const aValues = a.values;
    aValues[0] = 0;
    aValues[1] = 0;
    aValues[2] = 0;
    return a;
  }
  public zero(){
    return Vec3.Zero(this);
  }
  public static Floor(out: Vec3, a: Vec3){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = Math.floor(aValues[0]);
    outValues[1] = Math.floor(aValues[1]);
    outValues[2] = Math.floor(aValues[2]);
    return out;
  }
  public floor(){
    return Vec3.Floor(this, this);
  }
}
export class Vec4{
  declare private readonly __brand: 'Vec4';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(4);
  }
  public static FromValues(x: number, y: number, z: number, w: number){
    const out = new Vec4();
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    outValues[3] = w;
    return out;
  }
  public static Add(out: Vec4, a: Vec4, b: Vec4){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] + bValues[0];
    outValues[1] = aValues[1] + bValues[1];
    outValues[2] = aValues[2] + bValues[2];
    outValues[3] = aValues[3] + bValues[3];
    return out;
  }
  public add(b: Vec4){
    return Vec4.Add(this, this, b);
  }
  public static Ceil(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = Math.ceil(aValues[0]);
    outValues[1] = Math.ceil(aValues[1]);
    outValues[2] = Math.ceil(aValues[2]);
    outValues[3] = Math.ceil(aValues[3]);
    return out;
  }
  public ceil(){
    return Vec4.Ceil(this, this);
  }
  public static Clone(a: Vec4){
    const aValues = a.values;
    const out = new Vec4();
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    outValues[3] = aValues[3];
    return out;
  }
  public clone(){
    return Vec4.Clone(this);
  }
  public static Copy(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    outValues[3] = aValues[3];
    return out;
  }
  public copy(a: Vec4){
    return Vec4.Copy(this, a);
  }
  public static Create(){
    const out = new Vec4();
    const outValues = out.values;
    outValues[0] = 0;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    return out;
  }
  public static Cross(out: Vec4, u: Vec4, v: Vec4, w: Vec4){
    const uValues = u.values;
    const u1 = uValues[0];
    const u2 = uValues[1];
    const u3 = uValues[2];
    const u4 = uValues[3];
    const vValues = v.values;
    const v1 = vValues[0];
    const v2 = vValues[1];
    const v3 = vValues[2];
    const v4 = vValues[3];
    const wValues = w.values;
    const w1 = wValues[0];
    const w2 = wValues[1];
    const w3 = wValues[2];
    const w4 = wValues[3];
    
    const A = v3 * w4 - v4 * w3;
    const B = v2 * w4 - v4 * w2;
    const C = v2 * w3 - v3 * w2;
    const D = v1 * w4 - v4 * w1;
    const E = v1 * w3 - v3 * w1;
    const F = v1 * w2 - v2 * w1;

    const outValues = out.values;
    outValues[0] = u2 * A - u3 * B + u4 * C;
    outValues[1] = -u1 * A + u3 * D - u4 * E;
    outValues[2] = u1 * B - u2 * D + u4 * F;
    outValues[3] = -u1 * C + u2 * E - u3 * F;
    return out;
  }
  /** a = a x b */
  public cross(v: Vec4, w: Vec4){
    return Vec4.Cross(this, this, v, w);
  }
  public static Distance(a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    const x = bValues[0] - aValues[0];
    const y = bValues[1] - aValues[1];
    const z = bValues[2] - aValues[2];
    const w = bValues[3] - aValues[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }
  public distance(b: Vec4){
    return Vec4.Distance(this, b);
  }
  public static Div(out: Vec4, a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] / bValues[0];
    outValues[1] = aValues[1] / bValues[1];
    outValues[2] = aValues[2] / bValues[2];
    outValues[3] = aValues[3] / bValues[3];
    return out;
  }
  /** a = a / b */
  public div(b: Vec4){
    return Vec4.Div(this, this, b);
  }
  public static Dot(a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] * bValues[0] + aValues[1] * bValues[1] + aValues[2] * bValues[2]
     + aValues[3] * bValues[3];
  }
  public dot(b: Vec4){
    return Vec4.Dot(this, b);
  }
  /** approximately equal */
  public static Equals(a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    return Math.abs(aValues[0] - bValues[0]) < EPSILON &&
      Math.abs(aValues[1] - bValues[1]) < EPSILON &&
      Math.abs(aValues[2] - bValues[2]) < EPSILON &&
      Math.abs(aValues[3] - bValues[3]) < EPSILON;
  }
  /** approximately equal */
  public equals(b: Vec4){
    return Vec4.Equals(this, b);
  }
  public static ExactEquals(a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] === bValues[0] &&
      aValues[1] === bValues[1] &&
      aValues[2] === bValues[2] &&
      aValues[3] === bValues[3];
  }
  public exactEquals(b: Vec4){
    return Vec4.ExactEquals(this, b);
  }
  public static Floor(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = Math.floor(aValues[0]);
    outValues[1] = Math.floor(aValues[1]);
    outValues[2] = Math.floor(aValues[2]);
    outValues[3] = Math.floor(aValues[3]);
    return out;
  }
  public floor(){
    return Vec4.Floor(this, this);
  }
  public static Inverse(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValue = out.values;
    outValue[0] = 1 / aValues[0];
    outValue[1] = 1 / aValues[1];
    outValue[2] = 1 / aValues[2];
    outValue[3] = 1 / aValues[3];
    return out;
  }
  public inverse(){
    return Vec4.Inverse(this, this);
  }
  public static Length(a: Vec4){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    return Math.sqrt(ax * ax + ay * ay + az * az + aw * aw);
  }
  public length(){
    return Vec4.Length(this);
  }
  /** out = tb + (1 - t)a
   * @param t [0,1] -> [a, b]
  */
  public static Lerp(out: Vec4, a: Vec4, b: Vec4, t: number){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = ax + t * (bValues[0] - ax);
    outValues[1] = ay + t * (bValues[1] - ay);
    outValues[2] = az + t * (bValues[2] - az);
    outValues[3] = aw + t * (bValues[3] - aw);
    return out;
  }
  public static Max(out: Vec4, a: Vec4, b: Vec4){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = Math.max(aValues[0], bValues[0]);
    outValues[1] = Math.max(aValues[1], bValues[1]);
    outValues[2] = Math.max(aValues[2], bValues[2]);
    outValues[3] = Math.max(aValues[3], bValues[3]);
    return out;
  }
  public static Min(out: Vec4, a: Vec4, b: Vec4){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = Math.min(aValues[0], bValues[0]);
    outValues[1] = Math.min(aValues[1], bValues[1]);
    outValues[2] = Math.min(aValues[2], bValues[2]);
    outValues[3] = Math.min(aValues[3], bValues[3]);
    return out;
  }
  public static Multiply(out: Vec4, a: Vec4, b: Vec4){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] * bValues[0];
    outValues[1] = aValues[1] * bValues[1];
    outValues[2] = aValues[2] * bValues[2];
    outValues[3] = aValues[3] * bValues[3];
    return out;
  }
  public multiply(b: Vec4){
    return Vec4.Multiply(this, this, b);
  }
  public static Negate(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = -aValues[0];
    outValues[1] = -aValues[1];
    outValues[2] = -aValues[2];
    outValues[3] = -aValues[3];
    return out;
  }
  public negate(){
    return Vec4.Negate(this, this);
  }
  public static Normalize(out: Vec4, a: Vec4){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    let length = ax * ax + ay * ay + az * az + aw * aw;
    if(length > EPSILON){
      length = 1 / Math.sqrt(length);
    }
    const outValues = out.values;
    outValues[0] = ax * length;
    outValues[1] = ay * length;
    outValues[2] = az * length;
    outValues[3] = aw * length;
    return out;
  }
  public normalize(){
    return Vec4.Normalize(this, this);
  }
  /** random a vector its length = scale, all vector lay on hypersphere r = scale */
  public static Random(out: Vec4, scale = 1){
    //George Marsaglia
    let x1: number;
    let x2: number;
    let x3: number;
    let x4: number;
    let s1: number;
    let s2: number;

    do{
      x1 = Math.random() * 2 - 1;
      x2 = Math.random() * 2 - 1;
      s1 = x1 * x1 + x2 * x2;
    }
    while(s1 > 1 || s1 === 0);

    do{
      x3 = Math.random() * 2 - 1;
      x4 = Math.random() * 2 - 1;
      s2 = x3 * x3 + x4 * x4;
    }
    while(s2 > 1 || s2 === 0);

    const c = Math.sqrt((1 - s1) / (s2));

    const outValue = out.values;
    outValue[0] = x1 * scale;
    outValue[1] = x2 * scale;
    outValue[2] = x3 * c * scale;
    outValue[3] = x4 * c * scale;
    return out;
  }
  public static Round(out: Vec4, a: Vec4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = round(aValues[0]);
    outValues[1] = round(aValues[1]);
    outValues[2] = round(aValues[2]);
    outValues[3] = round(aValues[3]);
    return out;
  }
  public round(){
    return Vec4.Round(this, this);
  }
  public static Scale(out: Vec4, a: Vec4, c: number){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * c;
    outValues[1] = aValues[1] * c;
    outValues[2] = aValues[2] * c;
    outValues[3] = aValues[3] * c;
    return out;
  }
  public scale(c: number){
    return Vec4.Scale(this, this, c);
  }
  /** out = a + b * c */
  public static ScaleAndAdd(out: Vec4, a: Vec4, b: Vec4, c: number){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] + bValues[0] * c;
    outValues[1] = aValues[1] + bValues[1] * c;
    outValues[2] = aValues[2] + bValues[2] * c;
    outValues[3] = aValues[3] + bValues[3] * c;
    return out;
  }
  /** a = a + b * c */
  public scaleAndAdd(b: Vec4, c: number){
    return Vec4.ScaleAndAdd(this, this, b, c);
  }
  public static Set(out: Vec4, x: number, y: number, z: number, w: number){
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    outValues[3] = w;
    return out;
  }
  public set(x: number, y: number, z: number, w: number){
    return Vec4.Set(this, x, y, z, w);
  }
  public static SquaredDistance(a: Vec4, b: Vec4){
    const aValues = a.values;
    const bValues = b.values;
    const x = bValues[0] - aValues[0];
    const y = bValues[1] - aValues[1];
    const z = bValues[2] - aValues[2];
    const w = bValues[3] - aValues[3];
    return x * x + y * y + z * z + w * w;
  }
  public squaredDistance(b: Vec4){
    return Vec4.SquaredDistance(this, b);
  }
  public static SquaredLength(a: Vec4){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    return ax * ax + ay * ay + az * az + aw * aw;
  }
  public squaredLength(){
    return Vec4.SquaredLength(this);
  }
  public static String(a: Vec4){
    const aValues = a.values;
    return "vec4("
    + aValues[0] + ", "
    + aValues[1] + ", "
    + aValues[2] + ", "
    + aValues[3]
    + ")";
  }
  public string(){
    return Vec4.String(this);
  }
  public static Sub(out: Vec4, a: Vec4, b: Vec4){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] - bValues[0];
    outValues[1] = aValues[1] - bValues[1];
    outValues[2] = aValues[2] - bValues[2];
    outValues[3] = aValues[3] - bValues[3];
    return out;
  }
  public sub(b: Vec4){
    return Vec4.Sub(this, this, b);
  }
  public static TransformMat4(out: Vec4, a: Vec4, mat4: Mat4){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];
    const matValues = mat4.values;
    const outValues = out.values;
    outValues[0] = x * matValues[0] + y * matValues[4] + z * matValues[8] + w * matValues[12];
    outValues[1] = x * matValues[1] + y * matValues[5] + z * matValues[9] + w * matValues[13];
    outValues[2] = x * matValues[2] + y * matValues[6] + z * matValues[10] + w * matValues[14];
    outValues[3] = x * matValues[3] + y * matValues[7] + z * matValues[11] + w * matValues[15];
    return out;
  }
  public transformMat4(mat4: Mat4){
    return Vec4.TransformMat4(this, this, mat4);
  }
  /** out = qvq* */
  public static TransformQuat(out: Vec4, a: Vec4, quat: Quat){
    const quatValues = quat.values;
    const qx = quatValues[0];
    const qy = quatValues[1];
    const qz = quatValues[2];
    const qw = quatValues[3];
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    // 2(q x v)
    let gx = (qy * az - qz * ay) * 2;
    let gy = (qz * ax - qx * az) * 2;
    let gz = (qx * ay - qy * ax) * 2;

    const outValues = out.values;
    outValues[0] = ax + qw * gx + (qy * gz - qz * gy);
    outValues[1] = ay + qw * gy + (qz * gx - qx * gz);
    outValues[2] = az + qw * gz + (qx * gy - qy * gx);
    outValues[3] = aValues[3];
    return out;
  }
  /** v = qv(xyz)q* */
  public transformQuat(quat: Quat){
    return Vec4.TransformQuat(this, this, quat);
  }
  /** set to zero */
  public static Zero(a: Vec4){
    const aValues = a.values;
    aValues[0] = 0;
    aValues[1] = 0;
    aValues[2] = 0;
    aValues[3] = 0;
    return a;
  }
  public zero(){
    return Vec4.Zero(this);
  }
}
export class Quat{
  declare private readonly __brand: 'Quat';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(4);
  }
  public static FromValues(x: number, y: number, z: number, w: number){
    const out = new Quat();
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    outValues[3] = w;
    return out;
  }
  public static Add(out: Quat, a: Quat, b: Quat){
    const outValues = out.values;
    const aValues = a.values;
    const bValues = b.values;
    outValues[0] = aValues[0] + bValues[0];
    outValues[1] = aValues[1] + bValues[1];
    outValues[2] = aValues[2] + bValues[2];
    outValues[3] = aValues[3] + bValues[3];
    return out;
  }
  public add(b: Quat){
    return Quat.Add(this, this, b);
  }
  /** calculate w from xyz */
  public static CalculateW(out: Quat, a: Quat){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    outValues[3] = Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z));
    return out;
  }
  /** calculate w from xyz */
  public calculateW(){
    return Quat.CalculateW(this, this);
  }
  public static Clone(a: Quat){
    const aValues = a.values;
    const out = new Quat();
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    outValues[3] = aValues[3];
    return out;
  }
  public clone(){
    return Quat.Clone(this);
  }
  public static Conjugate(out: Quat, a: Quat){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = -aValues[0];
    outValues[1] = -aValues[1];
    outValues[2] = -aValues[2];
    outValues[3] = aValues[3];
    return out;
  }
  public conjugate(){
    return Quat.Conjugate(this, this);
  }
  public static Copy(out: Quat, a: Quat){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    outValues[3] = aValues[3];
    return out;
  }
  public copy(a: Quat){
    return Quat.Copy(this, a);
  }
  /** create identity quat */
  public static Create(){
    const out = new Quat();
    const outValues = out.values;
    outValues[0] = 0;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 1;
    return out;
  }
  public static Dot(a: Quat, b: Quat){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] * bValues[0] + aValues[1] * bValues[1] + aValues[2] * bValues[2]
     + aValues[3] * bValues[3];
  }
  public dot(b: Quat){
    return Quat.Dot(this, b);
  }
  /** approximately equal */
  public static Equals(a: Quat, b: Quat){
    const aValues = a.values;
    const bValues = b.values;
    return Math.abs(aValues[0] - bValues[0]) < EPSILON &&
      Math.abs(aValues[1] - bValues[1]) < EPSILON &&
      Math.abs(aValues[2] - bValues[2]) < EPSILON &&
      Math.abs(aValues[3] - bValues[3]) < EPSILON;
  }
  /** approximately equal */
  public equals(b: Quat){
    return Quat.Equals(this, b);
  }
  public static ExactEquals(a: Quat, b: Quat){
    const aValues = a.values;
    const bValues = b.values;
    return aValues[0] === bValues[0] &&
      aValues[1] === bValues[1] &&
      aValues[2] === bValues[2] &&
      aValues[3] === bValues[3];
  }
  public exactEquals(b: Quat){
    return Quat.ExactEquals(this, b);
  }
  /** out = exp(a), if a.w = 0 then the out is unit quat */
  public static Exp(out: Quat, a: Quat){
    // assume a = (alpha * n, w | 0)
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    const ew = Math.exp(w);
    const alpha = Math.sqrt(x * x + y * y + z * z);
    let norm = 0;
    if(alpha !== 0){
      norm = (Math.sin(alpha) * ew) / alpha;
    }

    const outValues = out.values;
    outValues[0] = x * norm;
    outValues[1] = y * norm;
    outValues[2] = z * norm;
    outValues[3] = Math.cos(alpha) * ew; // w
    return out;
  }
  /** out = exp(a), if a.w = 0 then the out is unit quat */
  public exp(){
    return Quat.Exp(this, this);
  }
  /** default xyz, out = qx * qy * qz  
   * @param x in degree
   * @param y in degree
   * @param z in degree
  */
  public static FromEuler(out: Quat, x: number, y: number, z: number, order: 'xyz' | 'zxy' | 'yzx' | 'zyx' | 'xzy' | 'yxz' = "xyz"){
    x = x * PIover360;
    y = y * PIover360;
    z = z * PIover360;
    
    const cx = Math.cos(x);
    const cy = Math.cos(y);
    const cz = Math.cos(z);
    const sx = Math.sin(x);
    const sy = Math.sin(y);
    const sz = Math.sin(z);

    const outValues = out.values;
    switch(order){
      case "xyz": {
        // + - + -
        outValues[0] = sx * cy * cz + cx * sy * sz;
        outValues[1] = cx * sy * cz - sx * cy * sz;
        outValues[2] = cx * cy * sz + sx * sy * cz;
        outValues[3] = cx * cy * cz - sx * sy * sz;
        break;
      }
      case "zxy": {
        outValues[0] = sx * cy * cz - cx * sy * sz;
        outValues[1] = cx * sy * cz + sx * cy * sz;
        outValues[2] = cx * cy * sz + sx * sy * cz;
        outValues[3] = cx * cy * cz - sx * sy * sz;
        break;
      }
      case "yzx": {
        outValues[0] = sx * cy * cz + cx * sy * sz;
        outValues[1] = cx * sy * cz + sx * cy * sz;
        outValues[2] = cx * cy * sz - sx * sy * cz;
        outValues[3] = cx * cy * cz - sx * sy * sz;
        break;
      }
      case "zyx": {
        // - + - +
        outValues[0] = sx * cy * cz - cx * sy * sz;
        outValues[1] = cx * sy * cz + sx * cy * sz;
        outValues[2] = cx * cy * sz - sx * sy * cz;
        outValues[3] = cx * cy * cz + sx * sy * sz;
        break;
      }
      case "xzy": {
        outValues[0] = sx * cy * cz - cx * sy * sz;
        outValues[1] = cx * sy * cz - sx * cy * sz;
        outValues[2] = cx * cy * sz + sx * sy * cz;
        outValues[3] = cx * cy * cz + sx * sy * sz;
        break;
      }
      case "yxz": {
        outValues[0] = sx * cy * cz + cx * sy * sz;
        outValues[1] = cx * sy * cz - sx * cy * sz;
        outValues[2] = cx * cy * sz - sx * sy * cz;
        outValues[3] = cx * cy * cz + sx * sy * sz;
        break;
      }
    }
    return out;
  }
  /** mat3 to quat, out is unit quaternion */
  public static FromMat3(out: Quat, mat3: Mat3){
    // Ken Shoemake
    const values = mat3.values;
    let m11 = values[0];
    let m21 = values[1];
    let m31 = values[2];
    let m12 = values[3];
    let m22 = values[4];
    let m32 = values[5];
    let m13 = values[6];
    let m23 = values[7];
    let m33 = values[8];
    const s1 = 1 / Math.sqrt(m11 * m11 + m21 * m21 + m31 * m31);
    const s2 = 1 / Math.sqrt(m12 * m12 + m22 * m22 + m32 * m32);
    const s3 = 1 / Math.sqrt(m13 * m13 + m23 * m23 + m33 * m33);
    m11 = m11 * s1;
    m21 = m21 * s1;
    m31 = m31 * s1;
    m12 = m12 * s2;
    m22 = m22 * s2;
    m32 = m32 * s2;
    m13 = m13 * s3;
    m23 = m23 * s3;
    m33 = m33 * s3;

    const outValues = out.values;
    let trace = m11 + m22 + m33;
    if(trace > 0){
      trace = 2 * Math.sqrt(1 + trace); // 4w
      outValues[0] = (m32 - m23) / trace; // 4wx
      outValues[1] = (m13 - m31) / trace; // 4wy
      outValues[2] = (m21 - m12) / trace; // 4wz
      outValues[3] = trace * 0.25;
    }
    else if(m11 > m22 && m11 > m33){
      trace = m11 - m22 - m33;
      trace = 2 * Math.sqrt(1 + trace); // 4x
      outValues[0] = trace * 0.25;
      outValues[1] = (m21 + m12) / trace; // 4xy
      outValues[2] = (m13 + m31) / trace; // 4xz
      outValues[3] = (m32 - m23) / trace; // 4wx
    }
    else if(m22 > m33){
      trace = m22 - m11 - m33;
      trace = 2 * Math.sqrt(1 + trace); // 4y
      outValues[0] = (m21 + m12) / trace; // 4xy
      outValues[1] = trace * 0.25;
      outValues[2] = (m32 + m23) / trace; // 4yz
      outValues[3] = (m13 - m31) / trace; // 4wy
    }
    else{
      trace = m33 - m11 - m22;
      trace = 2 * Math.sqrt(1 + trace); // 4z
      outValues[0] = (m13 + m31) / trace; // 4xz
      outValues[1] = (m32 + m23) / trace; // 4yz
      outValues[2] = trace * 0.25;
      outValues[3] = (m21 - m12) / trace; // 4wz
    }
    return out;
  }
  /** get smallest angle [0, pi] between a and b
   * @param a unit quaternion
   * @param b unit quaternion
   * @returns angle in radian
   */
  public static GetAngle(a: Quat, b: Quat){
    const dw = Math.abs(Quat.Dot(a, b)); // avoid -dw
    return dw > 1 ? 0 : 2 * Math.acos(dw);
  }
  /** get smallest angle [0, pi] between a and b
   * @param b unit quaternion
   * @returns angle in radian
   */
  public getAngle(b: Quat){
    return Quat.GetAngle(this, b);
  }
  /**
   * @param out axis of rotation
   * @returns angle of a [0, 2pi]
   */
  public static GetAxisAngle(out: Vec3, a: Quat){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = Math.min(1, Math.max(-1, aValues[3]));
    let length = Math.sqrt(x*x + y*y + z*z);
    if(length > EPSILON){
      length = 1 / length;
      const outValues = out.values;
      outValues[0] = x * length;
      outValues[1] = y * length;
      outValues[2] = z * length;
    }
    return Math.acos(w) * 2;
  }
  /**
   * @param out axis of rotation
   * @returns angle of a [0, 2pi]
   */
  public getAxisAngle(out: Vec3){
    return Quat.GetAxisAngle(out, this);
  }
  /** set to identity */
  public static Identity(out: Quat){
    const outValues = out.values;
    outValues[0] = 0;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 1;
    return out;
  }
  /** set to identity */
  public identity(){
    return Quat.Identity(this);
  }
  /** if quat is unit or rotation, using conjugate */
  public static Invert(out: Quat, a: Quat){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    let dot = x * x + y * y + z * z + w * w;

    const outValues = out.values;
    if(dot > EPSILON){
      dot = 1 / dot;
      outValues[0] = -x * dot;
      outValues[1] = -y * dot;
      outValues[2] = -z * dot;
      outValues[3] = w * dot;
    }
    else{
      outValues[0] = 0;
      outValues[1] = 0;
      outValues[2] = 0;
      outValues[3] = 0;
    }
    return out;
  }
  public invert(){
    return Quat.Invert(this, this);
  }
  public static Length(a: Quat){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    return Math.sqrt(ax * ax + ay * ay + az * az + aw * aw);
  }
  public length(){
    return Quat.Length(this);
  }
  /** out = tb + (1 - t)a
   * @param t [0,1] -> [a, b]
  */
  public static Lerp(out: Quat, a: Quat, b: Quat, t: number){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = ax + t * (bValues[0] - ax);
    outValues[1] = ay + t * (bValues[1] - ay);
    outValues[2] = az + t * (bValues[2] - az);
    outValues[3] = aw + t * (bValues[3] - aw);
    return out;
  }
  /** assume a is unit quaternion */
  public static Ln(out: Quat, a: Quat){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    const halfAngle = Math.acos(Math.max(-1, Math.min(1, w)));
    let norm = Math.sqrt(x * x + y * y + z * z);
    if(norm > EPSILON) norm = halfAngle / norm;
    else norm = 0;

    const outValues = out.values;
    outValues[0] = x * norm;
    outValues[1] = y * norm;
    outValues[2] = z * norm;
    outValues[3] = 0;
    return out;
  }
  public static Multiply(out: Quat, a: Quat, b: Quat){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];
    const bValues = b.values;
    const bx = bValues[0];
    const by = bValues[1];
    const bz = bValues[2];
    const bw = bValues[3];
    const outValues = out.values;
    outValues[3] = w * bw - x * bx - y * by - z * bz;
    outValues[0] = x * bw + w * bx - z * by + y * bz;
    outValues[1] = y * bw + z * bx + w * by - x * bz;
    outValues[2] = z * bw - y * bx + x * by + w * bz;
    return out;
  }
  /** a = a * b */
  public multiply(b: Quat){
    return Quat.Multiply(this, this, b);
  }
  public static Normalize(out: Quat, a: Quat){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    let length = ax * ax + ay * ay + az * az + aw * aw;
    if(length > EPSILON){
      length = 1 / Math.sqrt(length);
    }
    const outValues = out.values;
    outValues[0] = ax * length;
    outValues[1] = ay * length;
    outValues[2] = az * length;
    outValues[3] = aw * length;
    return out;
  }
  public normalize(){
    return Quat.Normalize(this, this);
  }
  public static Pow(out: Quat, a: Quat, b: number){
    Quat.Ln(out, a);
    Quat.Scale(out, out, b);
    Quat.Exp(out, out);
    return out;
  }
  public pow(b: number){
    return Quat.Pow(this, this, b);
  }
  /** random unit quaternion */
  public static Random(out: Quat){
    //George Marsaglia
    let x1: number;
    let x2: number;
    let x3: number;
    let x4: number;
    let s1: number;
    let s2: number;

    do{
      x1 = Math.random() * 2 - 1;
      x2 = Math.random() * 2 - 1;
      s1 = x1 * x1 + x2 * x2;
    }
    while(s1 > 1 || s1 === 0);

    do{
      x3 = Math.random() * 2 - 1;
      x4 = Math.random() * 2 - 1;
      s2 = x3 * x3 + x4 * x4;
    }
    while(s2 > 1 || s2 === 0);

    const c = Math.sqrt((1 - s1) / (s2));

    const outValue = out.values;
    outValue[0] = x1;
    outValue[1] = x2;
    outValue[2] = x3 * c;
    outValue[3] = x4 * c;
    return out;
  }
  /** out = a * qx, world rotation
   * @param angle in radian
   */
  public static RotateX(out: Quat, a: Quat, angle: number){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    angle = angle / 2;
    const cosx = Math.cos(angle);
    const sinx = Math.sin(angle);

    const outValues = out.values;
    outValues[0] = x * cosx + w * sinx;
    outValues[1] = y * cosx + z * sinx;
    outValues[2] = z * cosx - y * sinx;
    outValues[3] = w * cosx - x * sinx;
    return out;
  }
  /** a = a * qx, world rotation
   * @param angle in radian
   */
  public rotateX(angle: number){
    return Quat.RotateX(this, this, angle);
  }
  /** out = a * qy, world rotation
   * @param angle in radian
   */
  public static RotateY(out: Quat, a: Quat, angle: number){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    angle = angle / 2;
    const cosx = Math.cos(angle);
    const sinx = Math.sin(angle);

    const outValues = out.values;
    outValues[0] = x * cosx - z * sinx;
    outValues[1] = y * cosx + w * sinx;
    outValues[2] = z * cosx + x * sinx;
    outValues[3] = w * cosx - y * sinx;
    return out;
  }
  /** a = a * qy, world rotation
   * @param angle in radian
   */
  public rotateY(angle: number){
    return Quat.RotateY(this, this, angle);
  }
  /** out = a * qz, world rotation
   * @param angle in radian
   */
  public static RotateZ(out: Quat, a: Quat, angle: number){
    const aValues = a.values;
    const x = aValues[0];
    const y = aValues[1];
    const z = aValues[2];
    const w = aValues[3];

    angle = angle / 2;
    const cosx = Math.cos(angle);
    const sinx = Math.sin(angle);

    const outValues = out.values;
    outValues[0] = x * cosx + y * sinx;
    outValues[1] = y * cosx - x * sinx;
    outValues[2] = z * cosx + w * sinx;
    outValues[3] = w * cosx - z * sinx;
    return out;
  }
  /** a = a * qz, world rotation
   * @param angle in radian
   */
  public rotateZ(angle: number){
    return Quat.RotateZ(this, this, angle);
  }
  public static Scale(out: Quat, a: Quat, c: number){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * c;
    outValues[1] = aValues[1] * c;
    outValues[2] = aValues[2] * c;
    outValues[3] = aValues[3] * c;
    return out;
  }
  public scale(c: number){
    return Quat.Scale(this, this, c);
  }
  public static Set(out: Quat, x: number, y: number, z: number, w: number){
    const outValues = out.values;
    outValues[0] = x;
    outValues[1] = y;
    outValues[2] = z;
    outValues[3] = w;
    return out;
  }
  public set(x: number, y: number, z: number, w: number){
    return Quat.Set(this, x, y, z, w);
  }
  /** quat from axis and angle
   * @param axis should be a unit vector
   * @param angle in radian
   */
  public static SetAxisAngle(out: Quat, axis: Vec3, angle: number){
    angle = angle * 0.5;
    const s = Math.sin(angle);
    const axisValues = axis.values;
    const outValues = out.values;
    outValues[0] = s * axisValues[0];
    outValues[1] = s * axisValues[1];
    outValues[2] = s * axisValues[2];
    outValues[3] = Math.cos(angle);
    return out;
  }
  /** quat from axis and angle
   * @param axis should be a unit vector
   * @param angle in radian
   */
  public setAxisAngle(axis: Vec3, angle: number){
    return Quat.SetAxisAngle(this, axis, angle);
  }
  /** a, b should be unit quat 
   * @param t [0,1] -> [a, b]
  */
  public static Slerp(out: Quat, a: Quat, b: Quat, t: number){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    const bValues = b.values;
    let bx = bValues[0];
    let by = bValues[1];
    let bz = bValues[2];
    let bw = bValues[3];

    let dot = ax * bx + ay * by + az * bz + aw * bw; // cosOmega
    if(dot < 0){
      dot = -dot;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }

    const w = Math.acos(Math.max(-1, Math.min(1, dot))); // omega
    const sinw = Math.sin(w);
    let f1 = 1 - t;
    let f2 = t;
    if(sinw > EPSILON){
      f1 = Math.sin((1 - t) * w) / sinw;
      f2 = Math.sin(t * w) / sinw;
    }
    
    const outValues = out.values;
    outValues[0] = f1 * ax + f2 * bx;
    outValues[1] = f1 * ay + f2 * by;
    outValues[2] = f1 * az + f2 * bz;
    outValues[3] = f1 * aw + f2 * bw;
    return out;
  }
  public static SquaredLength(a: Quat){
    const aValues = a.values;
    const ax = aValues[0];
    const ay = aValues[1];
    const az = aValues[2];
    const aw = aValues[3];
    return ax * ax + ay * ay + az * az + aw * aw;
  }
  public squaredLength(){
    return Quat.SquaredLength(this);
  }
  public static String(a: Quat){
    const aValues = a.values;
    return "quat("
    + aValues[0] + ", "
    + aValues[1] + ", "
    + aValues[2] + ", "
    + aValues[3]
    + ")";
  }
  public string(){
    return Quat.String(this);
  }
}
export class Mat3{
  declare private readonly __brand: 'Mat3';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(9);
  }
  /** create identity matrix */
  public static Create(){
    const out = new Mat3();
    const outValues = out.values;
    outValues[0] = 1;
    outValues[1] = 0;
    outValues[2] = 0;

    outValues[3] = 0;
    outValues[4] = 1;
    outValues[5] = 0;

    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 1;
    return out;
  }
  public static FromValues(
    v0: number, v1: number, v2: number,
    v3: number, v4: number, v5: number,
    v6: number, v7: number, v8: number
  ){
    const out = new Mat3();
    const valuesOut = out.values;
    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;

    valuesOut[3] = v3;
    valuesOut[4] = v4;
    valuesOut[5] = v5;

    valuesOut[6] = v6;
    valuesOut[7] = v7;
    valuesOut[8] = v8;
    return out;
  }
  public static FromRowValues(
    v0: number, v3: number, v6: number,
    v1: number, v4: number, v7: number,
    v2: number, v5: number, v8: number
  ){
    const out = new Mat3();
    const valuesOut = out.values;
    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;

    valuesOut[3] = v3;
    valuesOut[4] = v4;
    valuesOut[5] = v5;

    valuesOut[6] = v6;
    valuesOut[7] = v7;
    valuesOut[8] = v8;
    return out;
  }
  public static Add(out: Mat3, a: Mat3, b: Mat3){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] + bValues[0];
    outValues[1] = aValues[1] + bValues[1];
    outValues[2] = aValues[2] + bValues[2];
    outValues[3] = aValues[3] + bValues[3];
    outValues[4] = aValues[4] + bValues[4];
    outValues[5] = aValues[5] + bValues[5];
    outValues[6] = aValues[6] + bValues[6];
    outValues[7] = aValues[7] + bValues[7];
    outValues[8] = aValues[8] + bValues[8];
    return out;
  }
  public add(b: Mat3){
    return Mat3.Add(this, this, b);
  }
  public static Clone(mat3: Mat3){
    const out = new Mat4();
    const outValues = out.values;
    const values = mat3.values;
    outValues[0] = values[0];
    outValues[1] = values[1];
    outValues[2] = values[2];
    outValues[3] = values[3];
    outValues[4] = values[4];
    outValues[5] = values[5];
    outValues[6] = values[6];
    outValues[7] = values[7];
    outValues[8] = values[8];
    return out;
  }
  public clone(){
    return Mat3.Clone(this);
  }
  public static Copy(out: Mat3, mat4: Mat3){
    const outValues = out.values;
    const values = mat4.values;
    outValues[0] = values[0];
    outValues[1] = values[1];
    outValues[2] = values[2];
    outValues[3] = values[3];
    outValues[4] = values[4];
    outValues[5] = values[5];
    outValues[6] = values[6];
    outValues[7] = values[7];
    outValues[8] = values[8];
    return out;
  }
  public copy(mat4: Mat3){
    return Mat3.Copy(this, mat4);
  }
  public static Det(mat3: Mat3){
    const values = mat3.values;
    const v0 = values[0],   v3 = values[3],   v6 = values[6];
    const v1 = values[1],   v4 = values[4],   v7 = values[7];
    const v2 = values[2],   v5 = values[5],   v8 = values[8];

    return v0 * (v4 * v8 - v7 * v5)
      - v3 * (v1 * v8 - v7 * v2)
      + v6 * (v1 * v5 - v4 * v2);
  }
  public det(){
    return Mat3.Det(this);
  }
  public static ExactEquals(a: Mat3, b: Mat3){
    const aValues = a.values;
    const bValues = b.values;
    const result = 
      aValues[0] === bValues[0] &&
      aValues[1] === bValues[1] &&
      aValues[2] === bValues[2] &&
      aValues[3] === bValues[3] &&
      aValues[4] === bValues[4] &&
      aValues[5] === bValues[5] &&
      aValues[6] === bValues[6] &&
      aValues[7] === bValues[7] &&
      aValues[8] === bValues[8];
    return result;
  }
  public exactEquals(b: Mat3){
    return Mat3.ExactEquals(this, b);
  }
  /** copy 3x3 top-left from mat4 */
  public static FromMat4(out: Mat3, a: Mat4){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0];
    outValues[1] = aValues[1];
    outValues[2] = aValues[2];
    outValues[3] = aValues[4];
    outValues[4] = aValues[5];
    outValues[5] = aValues[6];
    outValues[6] = aValues[8];
    outValues[7] = aValues[9];
    outValues[8] = aValues[10];
    return out;
  }
  /** quat to matrix */
  public static FromQuat(out: Mat3, quat: Quat){
    const quatValues = quat.values;
    const x = quatValues[0];
    const y = quatValues[1];
    const z = quatValues[2];
    const w = quatValues[3];

    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2; // ~ 2x^2
    const yy = y * y2; // ~ 2y^2
    const zz = z * z2; // ~ 2z^2
    const xy = x2 * y;
    const xz = x2 * z;
    const yz = y2 * z;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const outValues = out.values;
    outValues[0] = (1 - (yy + zz));
    outValues[1] = (xy + wz);
    outValues[2] = (xz - wy);

    outValues[3] = (xy - wz);
    outValues[4] = (1 - (xx + zz));
    outValues[5] = (yz + wx);

    outValues[6] = (xz + wy);
    outValues[7] = (yz - wx);
    outValues[8] = (1 - (xx + yy));
    return out;
  }
  /** 2d rotation, 3d rotation x axis*/
  public static FromRotation(out: Mat3, rad: number){
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = c;
    outValues[1] = s;
    outValues[2] = 0;
    outValues[3] = -s;
    outValues[4] = c;
    outValues[5] = 0;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 1;
    return out;
  }
  public static FromScaling(out: Mat3, scale: Vec2){
    const scaleValues = scale.values;
    const outValues = out.values;
    outValues[0] = scaleValues[0];
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = scaleValues[1];
    outValues[5] = 0;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 1;
    return out;
  }
  public static FromTranslation(out: Mat3, translate: Vec2){
    const translateValues = translate.values;
    const outValues = out.values;
    outValues[0] = 1;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 1;
    outValues[5] = 0;
    outValues[6] = translateValues[0];
    outValues[7] = translateValues[1];
    outValues[8] = 1;
    return out;
  }
  /** set to identity */
  public static Identity(out: Mat3){
    const outValues = out.values;
    outValues[0] = 1;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 1;
    outValues[5] = 0;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 1;
    return out;
  }
  /** set to identity */
  public identity(){
    return Mat3.Identity(this);
  }
  public static Invert(mat3: Mat3){
    const values = mat3.values;
    const v0 = values[0],   v3 = values[3],   v6 = values[6];
    const v1 = values[1],   v4 = values[4],   v7 = values[7];
    const v2 = values[2],   v5 = values[5],   v8 = values[8];

    let b0 = v4 * v8 - v7 * v5;
    let b3 = -v1 * v8 + v7 * v2;
    let b6 = v1 * v5 - v4 * v2;
    let det = v0 * b0 + v3 * b3 + v6 * b6;
    if(Math.abs(det) < EPSILON){
      return;
    }
    det = 1 / det;

    values[0] = b0 * det;
    values[1] = b3 * det;
    values[2] = b6 * det;
    values[3] = (-v3 * v8 + v6 * v5) * det;
    values[4] = (v0 * v8 - v6 * v2) * det;
    values[5] = (-v0 * v5 + v3 * v2) * det;
    values[6] = (v3 * v7 - v6 * v4) * det;
    values[7] = (-v0 * v7 + v6 * v1) * det;
    values[8] = (v0 * v4 - v3 * v1) * det;
  }
  public invert(){
    Mat3.Invert(this);
  }
  /** A * B */
  public static Multiply(out: Mat3, a: Mat3, b: Mat3){
    const aValues = a.values;
    const a11 = aValues[0];
    const a21 = aValues[1];
    const a31 = aValues[2];
    const a12 = aValues[3];
    const a22 = aValues[4];
    const a32 = aValues[5];
    const a13 = aValues[6];
    const a23 = aValues[7];
    const a33 = aValues[8];
    const bValues = b.values;
    const outValues = out.values;

    let b1 = bValues[0];
    let b2 = bValues[1];
    let b3 = bValues[2];
    outValues[0] = b1 * a11 + b2 * a12 + b3 * a13;
    outValues[1] = b1 * a21 + b2 * a22 + b3 * a23;
    outValues[2] = b1 * a31 + b2 * a32 + b3 * a33;

    b1 = bValues[3];
    b2 = bValues[4];
    b3 = bValues[5];
    outValues[3] = b1 * a11 + b2 * a12 + b3 * a13;
    outValues[4] = b1 * a21 + b2 * a22 + b3 * a23;
    outValues[5] = b1 * a31 + b2 * a32 + b3 * a33;

    b1 = bValues[6];
    b2 = bValues[7];
    b3 = bValues[8];
    outValues[6] = b1 * a11 + b2 * a12 + b3 * a13;
    outValues[7] = b1 * a21 + b2 * a22 + b3 * a23;
    outValues[8] = b1 * a31 + b2 * a32 + b3 * a33;

    return out;
  }
  /** A = A * B */
  public multiply(b: Mat3){
    return Mat3.Multiply(this, this, b);
  }
  /** A * c */
  public static MultiplyScalar(out: Mat3, a: Mat3, c: number){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * c;
    outValues[1] = aValues[1] * c;
    outValues[2] = aValues[2] * c;
    outValues[3] = aValues[3] * c;
    outValues[4] = aValues[4] * c;
    outValues[5] = aValues[5] * c;
    outValues[6] = aValues[6] * c;
    outValues[7] = aValues[7] * c;
    outValues[8] = aValues[8] * c;
    outValues[9] = aValues[9] * c;
    return out;
  }
  /** A = A * c */
  public multiplyScalar(c: number){
    return Mat3.MultiplyScalar(this, this, c);
  }
  /** A + (B * c) */
  public static MultiplyScalarAndAdd(out: Mat3, a: Mat3, b: Mat3, c: number){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;

    outValues[0] = aValues[0] + bValues[0] * c;
    outValues[1] = aValues[1] + bValues[1] * c;
    outValues[2] = aValues[2] + bValues[2] * c;
    outValues[3] = aValues[3] + bValues[3] * c;
    outValues[4] = aValues[4] + bValues[4] * c;
    outValues[5] = aValues[5] + bValues[5] * c;
    outValues[6] = aValues[6] + bValues[6] * c;
    outValues[7] = aValues[7] + bValues[7] * c;
    outValues[8] = aValues[8] + bValues[8] * c;
    outValues[9] = aValues[9] + bValues[9] * c;

    return out;
  }
  /** A = A + (B * c) */
  public multiplyScalarAndAdd(b: Mat3, c: number){
    return Mat3.MultiplyScalarAndAdd(this, this, b, c);
  }
  /** out = transpose(invert(mat4))
   * @param mat4 can contain (rotation, translation, non-uniform scale)
  */
  public static NormalFromMat4(out: Mat3, mat4: Mat4){
    const values = mat4.values;
    const v0 = values[0],   v3 = values[4],   v6 = values[8];
    const v1 = values[1],   v4 = values[5],   v7 = values[9];
    const v2 = values[2],   v5 = values[6],   v8 = values[10];

    let b0 = v4 * v8 - v7 * v5;
    let b3 = -v1 * v8 + v7 * v2;
    let b6 = v1 * v5 - v4 * v2;
    let det = v0 * b0 + v3 * b3 + v6 * b6;
    if(Math.abs(det) < EPSILON){
      return out;
    }
    det = 1 / det;

    const outValues = out.values;
    outValues[0] = b0 * det;
    outValues[1] = (-v3 * v8 + v6 * v5) * det;
    outValues[2] = (v3 * v7 - v6 * v4) * det;
    outValues[3] = b3 * det;
    outValues[4] = (v0 * v8 - v6 * v2) * det;
    outValues[5] = (-v0 * v7 + v6 * v1) * det;
    outValues[6] = b6 * det;
    outValues[7] = (-v0 * v5 + v3 * v2) * det;
    outValues[8] = (v0 * v4 - v3 * v1) * det;
    return out;
  }
  /** [0, w] -> [-1, 1] and [0, h] -> [1, -1] */
  public static Projection(out: Mat3, width: number, height: number){
    const outValues = out.values;
    outValues[0] = 2 / width;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = -2 / height;
    outValues[5] = 0;
    outValues[6] = -1;
    outValues[7] = 1;
    outValues[8] = 1;
    return out;
  }
  /** out = A(2x2) * R(rad) */
  public static Rotate(out: Mat3, a: Mat3, rad: number){
    const aValues = a.values;
    const v0 = aValues[0];
    const v1 = aValues[1];
    const v2 = aValues[3];
    const v3 = aValues[4];

    const c = Math.cos(rad);
    const s = Math.sin(rad);

    const outValues = out.values;
    outValues[0] = c * v0 + s * v2;
    outValues[1] = c * v1 + s * v3;
    outValues[3] = c * v2 - s * v0;
    outValues[4] = c * v3 - s * v1;

    outValues[2] = aValues[2];
    outValues[5] = aValues[5];
    outValues[6] = aValues[6];
    outValues[7] = aValues[7];
    outValues[8] = aValues[8];
    return out;
  }
  /** A = A(2x2) * R(rad) */
  public rotate(rad: number){
    return Mat3.Rotate(this, this, rad);
  }
  public static Scale(out: Mat3, a: Mat3, scale: Vec2){
    const scaleValues = scale.values;
    const x = scaleValues[0];
    const y = scaleValues[1];

    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * x;
    outValues[1] = aValues[1] * x;
    outValues[3] = aValues[3] * y;
    outValues[4] = aValues[4] * y;
    outValues[2] = aValues[2];
    outValues[5] = aValues[5];
    outValues[6] = aValues[6];
    outValues[7] = aValues[7];
    outValues[8] = aValues[8];
    return out;
  }
  public scale(scale: Vec2){
    return Mat3.Scale(this, this, scale);
  }
  public static Set(
    out: Mat3,
    v0: number, v1: number, v2: number,
    v3: number, v4: number, v5: number,
    v6: number, v7: number, v8: number
  ){
    const valuesOut = out.values;

    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;
    valuesOut[3] = v3;
    valuesOut[4] = v4;
    valuesOut[5] = v5;
    valuesOut[6] = v6;
    valuesOut[7] = v7;
    valuesOut[8] = v8;
    return out;
  }
  public set(
    v0: number, v1: number, v2: number,
    v3: number, v4: number, v5: number,
    v6: number, v7: number, v8: number
  ){
    return Mat3.Set(
      this,
      v0, v1, v2,
      v3, v4, v5,
      v6, v7, v8
    );
  }
  public static String(a: Mat3){
    const aValues = a.values;
    return "mat3("
    + aValues[0] + ", "
    + aValues[1] + ", "
    + aValues[2] + ", "
    + aValues[3] + ", "
    + aValues[4] + ", "
    + aValues[5] + ", "
    + aValues[6] + ", "
    + aValues[7] + ", "
    + aValues[8]
    + ")";
  }
  public string(){
    return Mat3.String(this);
  }
  public static Sub(out: Mat3, a: Mat3, b: Mat3){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] - bValues[0];
    outValues[1] = aValues[1] - bValues[1];
    outValues[2] = aValues[2] - bValues[2];
    outValues[3] = aValues[3] - bValues[3];
    outValues[4] = aValues[4] - bValues[4];
    outValues[5] = aValues[5] - bValues[5];
    outValues[6] = aValues[6] - bValues[6];
    outValues[7] = aValues[7] - bValues[7];
    outValues[8] = aValues[8] - bValues[8];
    return out;
  }
  public sub(b: Mat3){
    return Mat3.Sub(this, this, b);
  }
  /** out = A * T */
  public static Translate(out: Mat3, a: Mat3, translate: Vec2){
    const translateValues = translate.values;
    const x = translateValues[0];
    const y = translateValues[1];

    const aValues = a.values;
    const v0 = aValues[0];
    const v1 = aValues[1];
    const v2 = aValues[2];
    const v3 = aValues[3];
    const v4 = aValues[4];
    const v5 = aValues[5];
    const v6 = aValues[6];
    const v7 = aValues[7];
    const v8 = aValues[8];

    const outValues = out.values;
    outValues[0] = v0;
    outValues[1] = v1;
    outValues[2] = v2;
    outValues[3] = v3;
    outValues[4] = v4;
    outValues[5] = v5;
    outValues[6] = x * v0 + y * v3 + v6;
    outValues[7] = x * v1 + y * v4 + v7;
    outValues[8] = x * v2 + y * v5 + v8;
    return out;
  }
  /** A = A * T */
  public translate(translate: Vec2){
    return Mat3.Translate(this, this, translate);
  }
  public static Transpose(out: Mat3, a: Mat3){
    const aValues = a.values;
    const outValues = out.values;
    if(outValues === aValues){
      let t: number;
      t = outValues[1]; outValues[1] = outValues[3]; outValues[3] = t;
      t = outValues[2]; outValues[2] = outValues[6]; outValues[6] = t;

      t = outValues[5]; outValues[5] = outValues[7]; outValues[7] = t;
    }
    else{
      outValues[0] = aValues[0]; //
      outValues[1] = aValues[3];
      outValues[2] = aValues[6];

      outValues[3] = aValues[1];
      outValues[4] = aValues[4]; //
      outValues[5] = aValues[7];

      outValues[6] = aValues[2];
      outValues[7] = aValues[5];
      outValues[8] = aValues[8]; //
    }
  }
  public transpose(){
    return Mat3.Transpose(this, this);
  }
}
// missing adjoint, decompose, frob, fromQuat2, fromRotationTranslationScaleOrigin
// orthoZO, perpectiveZO
export class Mat4{
  declare private readonly __brand: 'Mat4';
  public values: Float32Array;
  constructor(){
    this.values = new Float32Array(16);
  }
  /** create identity matrix */
  public static Create(){
    const out = new Mat4();
    const outValues = out.values;
    outValues[0] = 1;
    outValues[5] = 1;
    outValues[10] = 1;
    outValues[15] = 1;

    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 0;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 0;
    outValues[9] = 0;
    outValues[11] = 0;
    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 0;
    return out;
  }
  public static FromValues(
    v0: number, v1: number, v2: number, v3: number,
    v4: number, v5: number, v6: number, v7: number,
    v8: number, v9: number, v10: number, v11: number,
    v12: number, v13: number, v14: number, v15: number,
  ){
    const out = new Mat4();
    const valuesOut = out.values;

    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;
    valuesOut[3] = v3;

    valuesOut[4] = v4;
    valuesOut[5] = v5;
    valuesOut[6] = v6;
    valuesOut[7] = v7;

    valuesOut[8] = v8;
    valuesOut[9] = v9;
    valuesOut[10] = v10;
    valuesOut[11] = v11;

    valuesOut[12] = v12;
    valuesOut[13] = v13;
    valuesOut[14] = v14;
    valuesOut[15] = v15;
    
    return out;
  }
  public static FromRowValues(
    v0: number, v4: number, v8: number, v12: number,
    v1: number, v5: number, v9: number, v13: number,
    v2: number, v6: number, v10: number, v14: number,
    v3: number, v7: number, v11: number, v15: number,
  ){
    const out = new Mat4();
    const valuesOut = out.values;

    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;
    valuesOut[3] = v3;

    valuesOut[4] = v4;
    valuesOut[5] = v5;
    valuesOut[6] = v6;
    valuesOut[7] = v7;

    valuesOut[8] = v8;
    valuesOut[9] = v9;
    valuesOut[10] = v10;
    valuesOut[11] = v11;

    valuesOut[12] = v12;
    valuesOut[13] = v13;
    valuesOut[14] = v14;
    valuesOut[15] = v15;
    
    return out;
  }
  public static Set(
    out: Mat4,
    v0: number, v1: number, v2: number, v3: number,
    v4: number, v5: number, v6: number, v7: number,
    v8: number, v9: number, v10: number, v11: number,
    v12: number, v13: number, v14: number, v15: number,
  ){
    const valuesOut = out.values;

    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;
    valuesOut[3] = v3;

    valuesOut[4] = v4;
    valuesOut[5] = v5;
    valuesOut[6] = v6;
    valuesOut[7] = v7;

    valuesOut[8] = v8;
    valuesOut[9] = v9;
    valuesOut[10] = v10;
    valuesOut[11] = v11;

    valuesOut[12] = v12;
    valuesOut[13] = v13;
    valuesOut[14] = v14;
    valuesOut[15] = v15;
    
    return out;
  }
  public set(
    v0: number, v1: number, v2: number, v3: number,
    v4: number, v5: number, v6: number, v7: number,
    v8: number, v9: number, v10: number, v11: number,
    v12: number, v13: number, v14: number, v15: number,
  ){
    return Mat4.Set(
      this,
      v0, v1, v2, v3,
      v4, v5, v6, v7,
      v8, v9, v10, v11,
      v12, v13, v14, v15
    );
  }
  public static SetRow(
    out: Mat4,
    v0: number, v4: number, v8: number, v12: number,
    v1: number, v5: number, v9: number, v13: number,
    v2: number, v6: number, v10: number, v14: number,
    v3: number, v7: number, v11: number, v15: number,
  ){
    const valuesOut = out.values;

    valuesOut[0] = v0;
    valuesOut[1] = v1;
    valuesOut[2] = v2;
    valuesOut[3] = v3;

    valuesOut[4] = v4;
    valuesOut[5] = v5;
    valuesOut[6] = v6;
    valuesOut[7] = v7;

    valuesOut[8] = v8;
    valuesOut[9] = v9;
    valuesOut[10] = v10;
    valuesOut[11] = v11;

    valuesOut[12] = v12;
    valuesOut[13] = v13;
    valuesOut[14] = v14;
    valuesOut[15] = v15;
    
    return out;
  }
  public setRow(
    v0: number, v4: number, v8: number, v12: number,
    v1: number, v5: number, v9: number, v13: number,
    v2: number, v6: number, v10: number, v14: number,
    v3: number, v7: number, v11: number, v15: number
  ){
    return Mat4.SetRow(
      this,
      v0, v4, v8, v12,
      v1, v5, v9, v13,
      v2, v6, v10, v14,
      v3, v7, v11, v15
    );
  }
  /** quat to matrix */
  public static FromQuat(out: Mat4, quat: Quat){
    const quatValues = quat.values;
    const x = quatValues[0];
    const y = quatValues[1];
    const z = quatValues[2];
    const w = quatValues[3];

    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2; // ~ 2x^2
    const yy = y * y2; // ~ 2y^2
    const zz = z * z2; // ~ 2z^2
    const xy = x2 * y;
    const xz = x2 * z;
    const yz = y2 * z;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const outValues = out.values;
    outValues[0] = (1 - (yy + zz));
    outValues[1] = (xy + wz);
    outValues[2] = (xz - wy);
    outValues[3] = 0;

    outValues[4] = (xy - wz);
    outValues[5] = (1 - (xx + zz));
    outValues[6] = (yz + wx);
    outValues[7] = 0;

    outValues[8] = (xz + wy);
    outValues[9] = (yz - wx);
    outValues[10] = (1 - (xx + yy));
    outValues[11] = 0;

    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 0;
    outValues[15] = 1;

    return out;
  }
  /** rotation matrix with Rodrigue */
  public static FromRotation(out: Mat4, rad: number, axis: Vec3){
    const axisValues = axis.values;
    let kx = axisValues[0];
    let ky = axisValues[1];
    let kz = axisValues[2];
    const len = 1 / Math.sqrt(kx * kx + ky * ky + kz * kz);
    kx = kx * len;
    ky = ky * len;
    kz = kz * len;

    const c = Math.cos(rad); const s = Math.sin(rad); const t = 1 - c;
    const outValues = out.values;
    outValues[0] = t * kx * kx + c;
    outValues[1] = t * kx * ky + s * kz;
    outValues[2] = t * kx * kz - s * ky;
    outValues[3] = 0;

    outValues[4] = t * kx * ky - s * kz;
    outValues[5] = t * ky * ky + c;
    outValues[6] = t * ky * kz + s * kx;
    outValues[7] = 0;

    outValues[8] = t * kx * kz + s * ky;
    outValues[9] = t * ky * kz - s * kx;
    outValues[10] = t * kz * kz + c;
    outValues[11] = 0;
    
    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 0;
    outValues[15] = 1;
    return out;
  }
  /** create RT matrix faster than manual multiplication TR */
  public static FromRotationTranslation(out: Mat4, quat: Quat, translate: Vec3){
    const quatValues = quat.values;
    const x = quatValues[0];
    const y = quatValues[1];
    const z = quatValues[2];
    const w = quatValues[3];
    const translateValues = translate.values;
    const tx = translateValues[0];
    const ty = translateValues[1];
    const tz = translateValues[2];
    
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2; // ~ 2x^2
    const yy = y * y2; // ~ 2y^2
    const zz = z * z2; // ~ 2z^2
    const xy = x2 * y;
    const xz = x2 * z;
    const yz = y2 * z;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const outValues = out.values;
    outValues[0] = (1 - (yy + zz));
    outValues[1] = (xy + wz);
    outValues[2] = (xz - wy);
    outValues[3] = 0;
    outValues[4] = (xy - wz);
    outValues[5] = (1 - (xx + zz));
    outValues[6] = (yz + wx);
    outValues[7] = 0;
    outValues[8] = (xz + wy);
    outValues[9] = (yz - wx);
    outValues[10] = (1 - (xx + yy));
    outValues[11] = 0;
    outValues[12] = tx;
    outValues[13] = ty;
    outValues[14] = tz;
    outValues[15] = 1;

    return out;
  }
  /** create RTS matrix faster than manual multiplication TRS */
  public static FromRotationTranslationScale(out: Mat4, quat: Quat, translate: Vec3, scale: Vec3){
    const quatValues = quat.values;
    const x = quatValues[0];
    const y = quatValues[1];
    const z = quatValues[2];
    const w = quatValues[3];
    const translateValues = translate.values;
    const tx = translateValues[0];
    const ty = translateValues[1];
    const tz = translateValues[2];
    const scaleValues = scale.values;
    const sx = scaleValues[0];
    const sy = scaleValues[1];
    const sz = scaleValues[2];
    
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2; // ~ 2x^2
    const yy = y * y2; // ~ 2y^2
    const zz = z * z2; // ~ 2z^2
    const xy = x2 * y;
    const xz = x2 * z;
    const yz = y2 * z;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const outValues = out.values;
    outValues[0] = (1 - (yy + zz)) * sx;
    outValues[1] = (xy + wz) * sx;
    outValues[2] = (xz - wy) * sx;
    outValues[3] = 0;
    outValues[4] = (xy - wz) * sy;
    outValues[5] = (1 - (xx + zz)) * sy;
    outValues[6] = (yz + wx) * sy;
    outValues[7] = 0;
    outValues[8] = (xz + wy) * sz;
    outValues[9] = (yz - wx) * sz;
    outValues[10] = (1 - (xx + yy)) * sz;
    outValues[11] = 0;
    outValues[12] = tx;
    outValues[13] = ty;
    outValues[14] = tz;
    outValues[15] = 1;

    return out;
  }
  public static FromScaling(out: Mat4, scale: Vec3){
    const scaleValues = scale.values;
    const sx = scaleValues[0];
    const sy = scaleValues[1];
    const sz = scaleValues[2];

    const outValues = out.values;
    outValues[0] = sx;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 0;
    outValues[5] = sy;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 0;
    outValues[9] = 0;
    outValues[10] = sz;
    outValues[11] = 0;
    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 0;
    outValues[15] = 1;

    return out;
  }
  public static FromTranslation(out: Mat4, translate: Vec3){
    const translateValues = translate.values;
    const tx = translateValues[0];
    const ty = translateValues[1];
    const tz = translateValues[2];

    const outValues = out.values;
    outValues[0] = 1;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 0;
    outValues[5] = 1;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 0;
    outValues[9] = 0;
    outValues[10] = 1;
    outValues[11] = 0;
    outValues[12] = tx;
    outValues[13] = ty;
    outValues[14] = tz;
    outValues[15] = 1;

    return out;
  }
  public static FromXRotation(out: Mat4, rad: number){
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    const outValues = out.values;
    outValues[0] = 1; outValues[4] = 0; outValues[8] = 0; outValues[12] = 0;
    outValues[1] = 0; outValues[5] = c; outValues[9] = -s; outValues[13] = 0;
    outValues[2] = 0; outValues[6] = s; outValues[10] = c; outValues[14] = 0;
    outValues[3] = 0; outValues[7] = 0; outValues[11] = 0; outValues[15] = 1;
    return out;
  }
  public static FromYRotation(out: Mat4, rad: number){
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    const outValues = out.values;
    outValues[0] = c; outValues[4] = 0; outValues[8] = s; outValues[12] = 0;
    outValues[1] = 0; outValues[5] = 1; outValues[9] = 0; outValues[13] = 0;
    outValues[2] = -s; outValues[6] = 0; outValues[10] = c; outValues[14] = 0;
    outValues[3] = 0; outValues[7] = 0; outValues[11] = 0; outValues[15] = 1;
    return out;
  }
  public static FromZRotation(out: Mat4, rad: number){
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    const outValues = out.values;
    outValues[0] = c; outValues[4] = -s; outValues[8] = 0; outValues[12] = 0;
    outValues[1] = s; outValues[5] = c; outValues[9] = 0; outValues[13] = 0;
    outValues[2] = 0; outValues[6] = 0; outValues[10] = 1; outValues[14] = 0;
    outValues[3] = 0; outValues[7] = 0; outValues[11] = 0; outValues[15] = 1;
    return out;
  }
  /** create perspective matrix with bounds */
  public static Frustum(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number){
    const rl = 1 / (right - left);
    const tb = 1 / (top - bottom);
    const nf = 1 / (near - far);
    const n2 = near * 2;

    const outValues = out.values;
    outValues[0] = n2 * rl;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;

    outValues[4] = 0;
    outValues[5] = n2 * tb;
    outValues[6] = 0;
    outValues[7] = 0;

    outValues[8] = (right + left) * rl;
    outValues[9] = (top + bottom) * tb;
    outValues[10] = (far + near) * nf;
    outValues[11] = -1;

    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = n2 * far * nf;
    outValues[15] = 0;

    return out;
  }
  /** matrix to quaternion*/
  public static GetRotation(out: Quat, mat4: Mat4){
    // Ken Shoemake
    const values = mat4.values;
    let m11 = values[0];
    let m21 = values[1];
    let m31 = values[2];
    let m12 = values[4];
    let m22 = values[5];
    let m32 = values[6];
    let m13 = values[8];
    let m23 = values[9];
    let m33 = values[10];
    const s1 = 1 / Math.sqrt(m11 * m11 + m21 * m21 + m31 * m31);
    const s2 = 1 / Math.sqrt(m12 * m12 + m22 * m22 + m32 * m32);
    const s3 = 1 / Math.sqrt(m13 * m13 + m23 * m23 + m33 * m33);
    m11 = m11 * s1;
    m21 = m21 * s1;
    m31 = m31 * s1;
    m12 = m12 * s2;
    m22 = m22 * s2;
    m32 = m32 * s2;
    m13 = m13 * s3;
    m23 = m23 * s3;
    m33 = m33 * s3;

    const outValues = out.values;
    let trace = m11 + m22 + m33;
    if(trace > 0){
      trace = 2 * Math.sqrt(1 + trace); // 4w
      outValues[0] = (m32 - m23) / trace; // 4wx
      outValues[1] = (m13 - m31) / trace; // 4wy
      outValues[2] = (m21 - m12) / trace; // 4wz
      outValues[3] = trace * 0.25;
    }
    else if(m11 > m22 && m11 > m33){
      trace = m11 - m22 - m33;
      trace = 2 * Math.sqrt(1 + trace); // 4x
      outValues[0] = trace * 0.25;
      outValues[1] = (m21 + m12) / trace; // 4xy
      outValues[2] = (m13 + m31) / trace; // 4xz
      outValues[3] = (m32 - m23) / trace; // 4wx
    }
    else if(m22 > m33){
      trace = m22 - m11 - m33;
      trace = 2 * Math.sqrt(1 + trace); // 4y
      outValues[0] = (m21 + m12) / trace; // 4xy
      outValues[1] = trace * 0.25;
      outValues[2] = (m32 + m23) / trace; // 4yz
      outValues[3] = (m13 - m31) / trace; // 4wy
    }
    else{
      trace = m33 - m11 - m22;
      trace = 2 * Math.sqrt(1 + trace); // 4z
      outValues[0] = (m13 + m31) / trace; // 4xz
      outValues[1] = (m32 + m23) / trace; // 4yz
      outValues[2] = trace * 0.25;
      outValues[3] = (m21 - m12) / trace; // 4wz
    }
    return out;
  }
  public static GetScaling(out: Vec3, mat4: Mat4){
    const values = mat4.values;
    const m0 = values[0];
    const m1 = values[1];
    const m2 = values[2];
    const m4 = values[4];
    const m5 = values[5];
    const m6 = values[6];
    const m8 = values[8];
    const m9 = values[9];
    const m10 = values[10];
    
    const outValues = out.values;
    outValues[0] = Math.sqrt(m0 * m0 + m1 * m1 + m2 * m2);
    outValues[1] = Math.sqrt(m4 * m4 + m5 * m5 + m6 * m6);
    outValues[2] = Math.sqrt(m8 * m8 + m9 * m9 + m10 * m10);
    return out;
  }
  public static GetTranslation(out: Vec3, mat4: Mat4){
    const values = mat4.values;
    const outValues = out.values;
    outValues[0] = values[12];
    outValues[1] = values[13];
    outValues[2] = values[14];
    return out;
  }
  /** set to identity */
  public static Identity(out: Mat4){
    const outValues = out.values;
    outValues[0] = 1;
    outValues[5] = 1;
    outValues[10] = 1;
    outValues[15] = 1;

    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;
    outValues[4] = 0;
    outValues[6] = 0;
    outValues[7] = 0;
    outValues[8] = 0;
    outValues[9] = 0;
    outValues[11] = 0;
    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 0;
    return out;
  }
  /** set to identity */
  public identity(){
    return Mat4.Identity(this);
  }
  /** view matrix
   * @param eye camera position
   * @param center focal point or looking point
   * @param up world up of camera
   */
  public static LookAt(out: Mat4, eye: Vec3, center: Vec3, up: Vec3){
    const eyeValues = eye.values;
    const eyeX = eyeValues[0];
    const eyeY = eyeValues[1];
    const eyeZ = eyeValues[2];
    const centerValues = center.values;
    
    // because look -z
    let z1 = eyeX - centerValues[0];
    let z2 = eyeY - centerValues[1];
    let z3 = eyeZ - centerValues[2];
    let len = Math.sqrt(z1 * z1 + z2 * z2 + z3 * z3);
    if(len < EPSILON){
      // z is zero vector
      return Mat4.Identity(out);
    }
    else{
      len = 1 / len;
      z1 = z1 * len;
      z2 = z2 * len;
      z3 = z3 * len;
    }

    const upValues = up.values;
    let y1 = upValues[0];
    let y2 = upValues[1];
    let y3 = upValues[2];
    // x = y cross z 
    let x1 = y2 * z3 - y3 * z2;
    let x2 = y3 * z1 - y1 * z3;
    let x3 = y1 * z2 - y2 * z1;
    len = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
    if(len < EPSILON){
      // z, y are parellel
      return Mat4.Identity(out);
    }
    else{
      len = 1 / len;
      x1 = x1 * len;
      x2 = x2 * len;
      x3 = x3 * len;
    }

    // y = z cross x
    y1 = z2 * x3 - z3 * x2;
    y2 = z3 * x1 - z1 * x3;
    y3 = z1 * x2 - z2 * x1;
    len = 1 / Math.sqrt(y1 * y1 + y2 * y2 + y3 * y3);
    y1 = y1 * len;
    y2 = y2 * len;
    y3 = y3 * len;

    const outValues = out.values;
    outValues[0] = x1; outValues[4] = x2; outValues[8] = x3;
    outValues[1] = y1; outValues[5] = y2; outValues[9] = y3;
    outValues[2] = z1; outValues[6] = z2; outValues[10] = z3;
    outValues[3] = 0; outValues[7] = 0; outValues[11] = 0;
    
    outValues[12] = -(eyeX * x1 + eyeY * x2 + eyeZ * x3);
    outValues[13] = -(eyeX * y1 + eyeY * y2 + eyeZ * y3);
    outValues[14] = -(eyeX * z1 + eyeY * z2 + eyeZ * z3);
    outValues[15] = 1;
    return out;
  }
  /** A * B */
  public static Multiply(out: Mat4, a: Mat4, b: Mat4){
    const aValues = a.values;
    const m1 = aValues[0];
    const m2 = aValues[1];
    const m3 = aValues[2];
    const m4 = aValues[3];
    const m5 = aValues[4];
    const m6 = aValues[5];
    const m7 = aValues[6];
    const m8 = aValues[7];
    const m9 = aValues[8];
    const m10 = aValues[9];
    const m11 = aValues[10];
    const m12 = aValues[11];
    const m13 = aValues[12];
    const m14 = aValues[13];
    const m15 = aValues[14];
    const m16 = aValues[15];
    
    const outValues = out.values;
    const bValues = b.values;

    let b1 = bValues[0];
    let b2 = bValues[1];
    let b3 = bValues[2];
    let b4 = bValues[3];
    outValues[0] = b1 * m1 + b2 * m5 + b3 * m9 + b4 * m13;
    outValues[1] = b1 * m2 + b2 * m6 + b3 * m10 + b4 * m14;
    outValues[2] = b1 * m3 + b2 * m7 + b3 * m11 + b4 * m15;
    outValues[3] = b1 * m4 + b2 * m8 + b3 * m12 + b4 * m16;

    b1 = bValues[4];
    b2 = bValues[5];
    b3 = bValues[6];
    b4 = bValues[7];
    outValues[4] = b1 * m1 + b2 * m5 + b3 * m9 + b4 * m13;
    outValues[5] = b1 * m2 + b2 * m6 + b3 * m10 + b4 * m14;
    outValues[6] = b1 * m3 + b2 * m7 + b3 * m11 + b4 * m15;
    outValues[7] = b1 * m4 + b2 * m8 + b3 * m12 + b4 * m16;

    b1 = bValues[8];
    b2 = bValues[9];
    b3 = bValues[10];
    b4 = bValues[11];
    outValues[8] = b1 * m1 + b2 * m5 + b3 * m9 + b4 * m13;
    outValues[9] = b1 * m2 + b2 * m6 + b3 * m10 + b4 * m14;
    outValues[10] = b1 * m3 + b2 * m7 + b3 * m11 + b4 * m15;
    outValues[11] = b1 * m4 + b2 * m8 + b3 * m12 + b4 * m16;

    b1 = bValues[12];
    b2 = bValues[13];
    b3 = bValues[14];
    b4 = bValues[15];
    outValues[12] = b1 * m1 + b2 * m5 + b3 * m9 + b4 * m13;
    outValues[13] = b1 * m2 + b2 * m6 + b3 * m10 + b4 * m14;
    outValues[14] = b1 * m3 + b2 * m7 + b3 * m11 + b4 * m15;
    outValues[15] = b1 * m4 + b2 * m8 + b3 * m12 + b4 * m16;

    return out;
  }
  /** A = A * B */
  public multiply(b: Mat4){
    return Mat4.Multiply(this, this, b);
  }
  /** A * c */
  public static MultiplyScalar(out: Mat4, a: Mat4, c: number){
    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * c;
    outValues[1] = aValues[1] * c;
    outValues[2] = aValues[2] * c;
    outValues[3] = aValues[3] * c;
    outValues[4] = aValues[4] * c;
    outValues[5] = aValues[5] * c;
    outValues[6] = aValues[6] * c;
    outValues[7] = aValues[7] * c;
    outValues[8] = aValues[8] * c;
    outValues[9] = aValues[9] * c;
    outValues[10] = aValues[10] * c;
    outValues[11] = aValues[11] * c;
    outValues[12] = aValues[12] * c;
    outValues[13] = aValues[13] * c;
    outValues[14] = aValues[14] * c;
    outValues[15] = aValues[15] * c;
    return out;
  }
  /** A = A * c */
  public multiplyScalar(c: number){
    return Mat4.MultiplyScalar(this, this, c);
  }
  /** A + (B * c) */
  public static MultiplyScalarAndAdd(out: Mat4, a: Mat4, b: Mat4, c: number){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;

    outValues[0] = aValues[0] + bValues[0] * c;
    outValues[1] = aValues[1] + bValues[1] * c;
    outValues[2] = aValues[2] + bValues[2] * c;
    outValues[3] = aValues[3] + bValues[3] * c;
    outValues[4] = aValues[4] + bValues[4] * c;
    outValues[5] = aValues[5] + bValues[5] * c;
    outValues[6] = aValues[6] + bValues[6] * c;
    outValues[7] = aValues[7] + bValues[7] * c;
    outValues[8] = aValues[8] + bValues[8] * c;
    outValues[9] = aValues[9] + bValues[9] * c;
    outValues[10] = aValues[10] + bValues[10] * c;
    outValues[11] = aValues[11] + bValues[11] * c;
    outValues[12] = aValues[12] + bValues[12] * c;
    outValues[13] = aValues[13] + bValues[13] * c;
    outValues[14] = aValues[14] + bValues[14] * c;
    outValues[15] = aValues[15] + bValues[15] * c;

    return out;
  }
  /** A = A + (B * c) */
  public multiplyScalarAndAdd(b: Mat4, c: number){
    return Mat4.MultiplyScalarAndAdd(this, this, b, c);
  }
  /** orthogonal projection matrix with negative -> one [-1, 1] */
  public static Ortho(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number){
    return Mat4.OrthoNO(out, left, right, bottom, top, near, far);
  }
  /** orthogonal projection matrix with negative -> one [-1, 1] */
  public static OrthoNO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number){
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    const outValues = out.values;
    outValues[0] = -2 * lr;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;

    outValues[4] = 0;
    outValues[5] = -2 * bt;
    outValues[6] = 0;
    outValues[7] = 0;

    outValues[8] = 0;
    outValues[9] = 0;
    outValues[10] = 2 * nf;
    outValues[11] = 0;

    outValues[12] = (left + right) * lr;
    outValues[13] = (bottom + top) * bt;
    outValues[14] = (near + far) * nf;
    outValues[15] = 1;
    
    return out;
  }
  /** perspective projection matrix with negative -> one [-1, 1] */
  public static Perspective(out: Mat4, fovy: number, aspect: number, near: number, far: number){
    return Mat4.PerspectiveNO(out, fovy, aspect, near, far);
  }
  /** perspective projection matrix with negative -> one [-1, 1] */
  public static PerspectiveNO(out: Mat4, fovy: number, aspect: number, near: number, far: number){
    const k = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    const outValues = out.values;
    outValues[0] = k / aspect;
    outValues[1] = 0;
    outValues[2] = 0;
    outValues[3] = 0;

    outValues[4] = 0;
    outValues[5] = k;
    outValues[6] = 0;
    outValues[7] = 0;

    outValues[8] = 0;
    outValues[9] = 0;
    outValues[10] = (near + far) * nf;
    outValues[11] = -1;

    outValues[12] = 0;
    outValues[13] = 0;
    outValues[14] = 2 * near * far * nf;
    outValues[15] = 0;

    return out;
  }
  /** rotate matrix A around axis with Rodrigue, A(3x3) * R(rad, axis),
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public static Rotate(out: Mat4, a: Mat4, rad: number, axis: Vec3){
    const axisValues = axis.values;
    let kx = axisValues[0];
    let ky = axisValues[1];
    let kz = axisValues[2];
    const len = 1 / Math.sqrt(kx * kx + ky * ky + kz * kz);
    kx = kx * len;
    ky = ky * len;
    kz = kz * len;

    const aValues = a.values;
    const m1 = aValues[0];
    const m2 = aValues[1];
    const m3 = aValues[2];
    const m4 = aValues[4];
    const m5 = aValues[5];
    const m6 = aValues[6];
    const m7 = aValues[8];
    const m8 = aValues[9];
    const m9 = aValues[10];

    const c = Math.cos(rad); const s = Math.sin(rad); const t = 1 - c;
    let b1 = t * kx * kx + c;
    let b2 = t * kx * ky + s * kz;
    let b3 = t * kx * kz - s * ky;
    const outValues = out.values;
    outValues[0] = b1 * m1 + b2 * m4 + b3 * m7;
    outValues[1] = b1 * m2 + b2 * m5 + b3 * m8;
    outValues[2] = b1 * m3 + b2 * m6 + b3 * m9;

    b1 = t * kx * ky - s * kz;
    b2 = t * ky * ky + c;
    b3 = t * ky * kz + s * kx;
    outValues[4] = b1 * m1 + b2 * m4 + b3 * m7;
    outValues[5] = b1 * m2 + b2 * m5 + b3 * m8;
    outValues[6] = b1 * m3 + b2 * m6 + b3 * m9;

    b1 = t * kx * kz + s * ky;
    b2 = t * ky * kz - s * kx;
    b3 = t * kz * kz + c;
    outValues[8] = b1 * m1 + b2 * m4 + b3 * m7;
    outValues[9] = b1 * m2 + b2 * m5 + b3 * m8;
    outValues[10] = b1 * m3 + b2 * m6 + b3 * m9;

    if(outValues !== aValues){
      outValues[3] = aValues[3];
      outValues[7] = aValues[7];
      outValues[11] = aValues[11];

      outValues[12] = aValues[12];
      outValues[13] = aValues[13];
      outValues[14] = aValues[14];
      outValues[15] = aValues[15];
    }

    return out;
  }
  /** rotate matrix A around axis with Rodrigue, A(3x3) * R(rad, axis),
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public rotate(rad: number, axis: Vec3){
    return Mat4.Rotate(this, this, rad, axis);
  }
  /** rotate matrix A around X axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public static RotateX(out: Mat4, a: Mat4, rad: number){
    const aValues = a.values;
    const m4 = aValues[4];
    const m5 = aValues[5];
    const m6 = aValues[6];
    const m7 = aValues[8];
    const m8 = aValues[9];
    const m9 = aValues[10];

    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[4] = c * m4 + s * m7;
    outValues[5] = c * m5 + s * m8;
    outValues[6] = c * m6 + s * m9;

    outValues[8] = c * m7 - s * m4;
    outValues[9] = c * m8 - s * m5;
    outValues[10] = c * m9 - s * m6;

    if(outValues !== aValues){
      outValues[0] = aValues[0];
      outValues[1] = aValues[1];
      outValues[2] = aValues[2];
      outValues[3] = aValues[3];

      outValues[7] = aValues[7];
      outValues[11] = aValues[11];

      outValues[12] = aValues[12];
      outValues[13] = aValues[13];
      outValues[14] = aValues[14];
      outValues[15] = aValues[15];
    }
    return out;
  }
  /** rotate matrix A around X axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public rotateX(rad: number){
    return Mat4.RotateX(this, this, rad);
  }
  /** rotate matrix A around Y axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public static RotateY(out: Mat4, a: Mat4, rad: number){
    const aValues = a.values;
    const m0 = aValues[0];
    const m1 = aValues[1];
    const m2 = aValues[2];
    const m7 = aValues[8];
    const m8 = aValues[9];
    const m9 = aValues[10];

    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = c * m0 - s * m7;
    outValues[1] = c * m1 - s * m8;
    outValues[2] = c * m2 - s * m9;

    outValues[8] = s * m0 + c * m7;
    outValues[9] = s * m1 + c * m8;
    outValues[10] = s * m2 + c * m9;

    if(outValues !== aValues){
      outValues[3] = aValues[3];

      outValues[4] = aValues[4];
      outValues[5] = aValues[5];
      outValues[6] = aValues[6];
      outValues[7] = aValues[7];

      outValues[11] = aValues[11];

      outValues[12] = aValues[12];
      outValues[13] = aValues[13];
      outValues[14] = aValues[14];
      outValues[15] = aValues[15];
    }
    return out;
  }
  /** rotate matrix A around Y axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public rotateY(rad: number){
    return Mat4.RotateY(this, this, rad);
  }
  /** rotate matrix A around Z axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public static RotateZ(out: Mat4, a: Mat4, rad: number){
    const aValues = a.values;
    const m1 = aValues[0];
    const m2 = aValues[1];
    const m3 = aValues[2];
    const m4 = aValues[4];
    const m5 = aValues[5];
    const m6 = aValues[6];

    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const outValues = out.values;
    outValues[0] = c * m1 + s * m4;
    outValues[1] = c * m2 + s * m5;
    outValues[2] = c * m3 + s * m6;

    outValues[4] = c * m4 - s * m1;
    outValues[5] = c * m5 - s * m2;
    outValues[6] = c * m6 - s * m3;

    if(outValues !== aValues){
      outValues[8] = aValues[8];
      outValues[9] = aValues[9];
      outValues[10] = aValues[10];
      outValues[11] = aValues[11];

      outValues[3] = aValues[3];
      outValues[7] = aValues[7];

      outValues[12] = aValues[12];
      outValues[13] = aValues[13];
      outValues[14] = aValues[14];
      outValues[15] = aValues[15];
    }
    return out;
  }
  /** rotate matrix A around Z axis, A(3x3) * R,
   * the matrix should contain only rotation, uniform-scale, translate 
   */
  public rotateZ(rad: number){
    return Mat4.RotateZ(this, this, rad);
  }
  /** scale matrix A, A(3x3) * S */
  public static Scale(out: Mat4, a: Mat4, scaler: Vec3){
    const scaleValues = scaler.values;
    const sx = scaleValues[0];
    const sy = scaleValues[1];
    const sz = scaleValues[2];

    const aValues = a.values;
    const outValues = out.values;
    outValues[0] = aValues[0] * sx;
    outValues[1] = aValues[1] * sx;
    outValues[2] = aValues[2] * sx;

    outValues[4] = aValues[4] * sy;
    outValues[5] = aValues[5] * sy;
    outValues[6] = aValues[6] * sy;

    outValues[8] = aValues[8] * sz;
    outValues[9] = aValues[9] * sz;
    outValues[10] = aValues[10] * sz;

    if(outValues !== aValues){
      outValues[3] = aValues[3];
      outValues[7] = aValues[7];
      outValues[11] = aValues[11];

      outValues[12] = aValues[12];
      outValues[13] = aValues[13];
      outValues[14] = aValues[14];
      outValues[15] = aValues[15];
    }
    return out;
  }
  /** scale matrix A, A(3x3) * S */
  public scale(scaler: Vec3){
    return Mat4.Scale(this, this, scaler);
  }
  public static String(a: Mat4){
    const aValues = a.values;
    return "mat4("
    + aValues[0] + ", "
    + aValues[1] + ", "
    + aValues[2] + ", "
    + aValues[3] + ", "
    + aValues[4] + ", "
    + aValues[5] + ", "
    + aValues[6] + ", "
    + aValues[7] + ", "
    + aValues[8] + ", "
    + aValues[9] + ", "
    + aValues[10] + ", "
    + aValues[11] + ", "
    + aValues[12] + ", "
    + aValues[13] + ", "
    + aValues[14] + ", "
    + aValues[15]
    + ")";
  }
  public string(){
    return Mat4.String(this);
  }
  /** create matrix look target(center) with -z forward */
  public static TargetTo(out: Mat4, eye: Vec3, center: Vec3, up: Vec3){
    const eyeValues = eye.values;
    const eyeX = eyeValues[0];
    const eyeY = eyeValues[1];
    const eyeZ = eyeValues[2];
    const centerValues = center.values;
    
    // because look -z
    let z1 = eyeX - centerValues[0];
    let z2 = eyeY - centerValues[1];
    let z3 = eyeZ - centerValues[2];
    let len = Math.sqrt(z1 * z1 + z2 * z2 + z3 * z3);
    if(len < EPSILON){
      // z is zero vector
      return Mat4.Identity(out);
    }
    else{
      len = 1 / len;
      z1 = z1 * len;
      z2 = z2 * len;
      z3 = z3 * len;
    }

    const upValues = up.values;
    let y1 = upValues[0];
    let y2 = upValues[1];
    let y3 = upValues[2];
    // x = y cross z 
    let x1 = y2 * z3 - y3 * z2;
    let x2 = y3 * z1 - y1 * z3;
    let x3 = y1 * z2 - y2 * z1;
    len = Math.sqrt(x1 * x1 + x2 * x2 + x3 * x3);
    if(len < EPSILON){
      // z, y are parellel
      return Mat4.Identity(out);
    }
    else{
      len = 1 / len;
      x1 = x1 * len;
      x2 = x2 * len;
      x3 = x3 * len;
    }

    // y = z cross x
    y1 = z2 * x3 - z3 * x2;
    y2 = z3 * x1 - z1 * x3;
    y3 = z1 * x2 - z2 * x1;
    len = 1 / Math.sqrt(y1 * y1 + y2 * y2 + y3 * y3);
    y1 = y1 * len;
    y2 = y2 * len;
    y3 = y3 * len;

    const outValues = out.values;
    outValues[0] = x1;
    outValues[1] = x2;
    outValues[2] = x3;
    outValues[3] = 0;

    outValues[4] = y1;
    outValues[5] = y2;
    outValues[6] = y3;
    outValues[7] = 0;

    outValues[8] = z1;
    outValues[9] = z2;
    outValues[10] = z3;
    outValues[11] = 0;
    
    outValues[12] = eyeX;
    outValues[13] = eyeY;
    outValues[14] = eyeZ;
    outValues[15] = 1;
  }
  /** out = A * T */
  public static Translate(out: Mat4, a: Mat4, translate: Vec3){
    const translateValues = translate.values;
    const tx = translateValues[0];
    const ty = translateValues[1];
    const tz = translateValues[2];

    const aValues = a.values;
    const outValues = out.values;
    outValues[12] = tx * aValues[0] + ty * aValues[4] + tz * aValues[8] + aValues[12];
    outValues[13] = tx * aValues[1] + ty * aValues[5] + tz * aValues[9] + aValues[13];
    outValues[14] = tx * aValues[2] + ty * aValues[6] + tz * aValues[10] + aValues[14];
    outValues[15] = tx * aValues[3] + ty * aValues[7] + tz * aValues[11] + aValues[15];
    if(outValues !== aValues){
      outValues[0] = aValues[0];
      outValues[1] = aValues[1];
      outValues[2] = aValues[2];
      outValues[3] = aValues[3];

      outValues[4] = aValues[4];
      outValues[5] = aValues[5];
      outValues[6] = aValues[6];
      outValues[7] = aValues[7];

      outValues[8] = aValues[8];
      outValues[9] = aValues[9];
      outValues[10] = aValues[10];
      outValues[11] = aValues[11];
    }

    return out;
  }
  /** A = A * T */
  public translate(translate: Vec3){
    return Mat4.Translate(this, this, translate);
  }

  public static ExactEquals(a: Mat4, b: Mat4){
    const aValues = a.values;
    const bValues = b.values;
    const result = 
      aValues[0] === bValues[0] &&
      aValues[1] === bValues[1] &&
      aValues[2] === bValues[2] &&
      aValues[3] === bValues[3] &&
      aValues[4] === bValues[4] &&
      aValues[5] === bValues[5] &&
      aValues[6] === bValues[6] &&
      aValues[7] === bValues[7] &&
      aValues[8] === bValues[8] &&
      aValues[9] === bValues[9] &&
      aValues[10] === bValues[10] &&
      aValues[11] === bValues[11] &&
      aValues[12] === bValues[12] &&
      aValues[13] === bValues[13] &&
      aValues[14] === bValues[14] &&
      aValues[15] === bValues[15];
    return result;
  }
  public exactEquals(b: Mat4){
    return Mat4.ExactEquals(this, b);
  }
  public static Add(out: Mat4, a: Mat4, b: Mat4){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] + bValues[0];
    outValues[1] = aValues[1] + bValues[1];
    outValues[2] = aValues[2] + bValues[2];
    outValues[3] = aValues[3] + bValues[3];
    outValues[4] = aValues[4] + bValues[4];
    outValues[5] = aValues[5] + bValues[5];
    outValues[6] = aValues[6] + bValues[6];
    outValues[7] = aValues[7] + bValues[7];
    outValues[8] = aValues[8] + bValues[8];
    outValues[9] = aValues[9] + bValues[9];
    outValues[10] = aValues[10] + bValues[10];
    outValues[11] = aValues[11] + bValues[11];
    outValues[12] = aValues[12] + bValues[12];
    outValues[13] = aValues[13] + bValues[13];
    outValues[14] = aValues[14] + bValues[14];
    outValues[15] = aValues[15] + bValues[15];
    return out;
  }
  public add(b: Mat4){
    return Mat4.Add(this, this, b);
  }
  public static Sub(out: Mat4, a: Mat4, b: Mat4){
    const aValues = a.values;
    const bValues = b.values;
    const outValues = out.values;
    outValues[0] = aValues[0] - bValues[0];
    outValues[1] = aValues[1] - bValues[1];
    outValues[2] = aValues[2] - bValues[2];
    outValues[3] = aValues[3] - bValues[3];
    outValues[4] = aValues[4] - bValues[4];
    outValues[5] = aValues[5] - bValues[5];
    outValues[6] = aValues[6] - bValues[6];
    outValues[7] = aValues[7] - bValues[7];
    outValues[8] = aValues[8] - bValues[8];
    outValues[9] = aValues[9] - bValues[9];
    outValues[10] = aValues[10] - bValues[10];
    outValues[11] = aValues[11] - bValues[11];
    outValues[12] = aValues[12] - bValues[12];
    outValues[13] = aValues[13] - bValues[13];
    outValues[14] = aValues[14] - bValues[14];
    outValues[15] = aValues[15] - bValues[15];
    return out;
  }
  public sub(b: Mat4){
    return Mat4.Sub(this, this, b);
  }
  public static Clone(mat4: Mat4){
    const out = new Mat4();
    const outValues = out.values;
    const values = mat4.values;
    outValues[0] = values[0];
    outValues[1] = values[1];
    outValues[2] = values[2];
    outValues[3] = values[3];
    outValues[4] = values[4];
    outValues[5] = values[5];
    outValues[6] = values[6];
    outValues[7] = values[7];
    outValues[8] = values[8];
    outValues[9] = values[9];
    outValues[10] = values[10];
    outValues[11] = values[11];
    outValues[12] = values[12];
    outValues[13] = values[13];
    outValues[14] = values[14];
    outValues[15] = values[15];
    return out;
  }
  public clone(){
    return Mat4.Clone(this);
  }
  public static Copy(out: Mat4, mat4: Mat4){
    const outValues = out.values;
    const values = mat4.values;
    outValues[0] = values[0];
    outValues[1] = values[1];
    outValues[2] = values[2];
    outValues[3] = values[3];
    outValues[4] = values[4];
    outValues[5] = values[5];
    outValues[6] = values[6];
    outValues[7] = values[7];
    outValues[8] = values[8];
    outValues[9] = values[9];
    outValues[10] = values[10];
    outValues[11] = values[11];
    outValues[12] = values[12];
    outValues[13] = values[13];
    outValues[14] = values[14];
    outValues[15] = values[15];
    return out;
  }
  public copy(mat4: Mat4){
    return Mat4.Copy(this, mat4);
  }

  public static Det(mat4: Mat4){
    const values = mat4.values;
    const v0 = values[0],   v1 = values[1],   v2 = values[2],   v3 = values[3];
    const v4 = values[4],   v5 = values[5],   v6 = values[6],   v7 = values[7];
    const v8 = values[8],   v9 = values[9],   v10 = values[10], v11 = values[11];
    const v12 = values[12], v13 = values[13], v14 = values[14], v15 = values[15];

    const A = v10 * v15 - v14 * v11;
    const B = v6 * v15 - v14 * v7;
    const C = v6 * v11 - v10 * v7;
    const D = v2 * v15 - v14 * v3;
    const E = v2 * v11 - v10 * v3;
    const F = v2 * v7 - v6 * v3;
    const C11 = v5 * A - v9 * B + v13 * C;
    const C12 = v1 * A - v9 * D + v13 * E;
    const C13 = v1 * B - v5 * D + v13 * F;
    const C14 = v1 * C - v5 * E + v9 * F;

    return v0 * C11 - v4 * C12 + v8 * C13 - v12 * C14;
  }
  public det(){
    return Mat4.Det(this);
  }
  public static Invert(mat4: Mat4){
    const values = mat4.values;
    const v0 = values[0],   v1 = values[1],   v2 = values[2],   v3 = values[3];
    const v4 = values[4],   v5 = values[5],   v6 = values[6],   v7 = values[7];
    const v8 = values[8],   v9 = values[9],   v10 = values[10], v11 = values[11];
    const v12 = values[12], v13 = values[13], v14 = values[14], v15 = values[15];

    const A = v0 * v5 - v4 * v1;
    const B = v0 * v9 - v8 * v1;
    const C = v0 * v13 - v12 * v1;
    const D = v4 * v9 - v8 * v5;
    const E = v4 * v13 - v12 * v5;
    const F = v8 * v13 - v12 * v9;
    const G = v2 * v7 - v6 * v3;
    const H = v2 * v11 - v10 * v3;
    const I = v2 * v15 - v14 * v3;
    const J = v6 * v11 - v10 * v7;
    const K = v6 * v15 - v14 * v7;
    const L = v10 * v15 - v14 * v11;
    
    const C11 = v5 * L - v9 * K + v13 * J;
    const C12 = -v1 * L + v9 * I - v13 * H;
    const C13 = v1 * K - v5 * I + v13 * G;
    const C14 = -v1 * J + v5 * H - v9 * G;
    const det = v0 * C11 + v4 * C12 + v8 * C13 + v12 * C14;
    if(Math.abs(det) < 1e-6) return;
    const invDet = 1 / det;

    values[0] = invDet * C11;
    values[1] = invDet * C12;
    values[2] = invDet * C13;
    values[3] = invDet * C14;
    values[4] = invDet * (-v4 * L + v8 * K - v12 * J);
    values[5] = invDet * (v0 * L - v8 * I + v12 * H);
    values[6] = invDet * (-v0 * K + v4 * I - v12 * G);
    values[7] = invDet * (v0 * J - v4 * H + v8 * G);
    values[8] = invDet * (v7 * F - v11 * E + v15 * D);
    values[9] = invDet * (-v3 * F + v11 * C - v15 * B);
    values[10] = invDet * (v3 * E - v7 * C + v15 * A);
    values[11] = invDet * (-v3 * D + v7 * B - v11 * A);
    values[12] = invDet * (-v6 * F + v10 * E - v14 * D);
    values[13] = invDet * (v2 * F - v10 * C + v14 * B);
    values[14] = invDet * (-v2 * E + v6 * C - v14 * A);
    values[15] = invDet * (v2 * D - v6 * B + v10 * A);
  }
  public invert(){
    Mat4.Invert(this);
  }
  public static Transpose(out: Mat4, a: Mat4){
    const aValues = a.values;
    const outValues = out.values;

    if(outValues === aValues){
      // ignore 0 5 10 15
      let t: number;
      t = outValues[1]; outValues[1] = outValues[4]; outValues[4] = t;
      t = outValues[2]; outValues[2] = outValues[8]; outValues[8] = t;
      t = outValues[3]; outValues[3] = outValues[12]; outValues[12] = t;

      t = outValues[6]; outValues[6] = outValues[9]; outValues[9] = t;
      t = outValues[7]; outValues[7] = outValues[13]; outValues[13] = t;

      t = outValues[11]; outValues[11] = outValues[14]; outValues[14] = t;
    }
    else{
      outValues[0] = aValues[0]; //
      outValues[1] = aValues[4];
      outValues[2] = aValues[8];
      outValues[3] = aValues[12];

      outValues[4] = aValues[1];
      outValues[5] = aValues[5]; //
      outValues[6] = aValues[9];
      outValues[7] = aValues[13];

      outValues[8] = aValues[2];
      outValues[9] = aValues[6];
      outValues[10] = aValues[10]; //
      outValues[11] = aValues[14];

      outValues[12] = aValues[3];
      outValues[13] = aValues[7];
      outValues[14] = aValues[11];
      outValues[15] = aValues[15]; //
    }
    return out;
  }
  public transpose(){
    return Mat4.Transpose(this, this);
  }
}
