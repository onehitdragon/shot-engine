import { expect, test, describe } from 'vitest';
import { Deg2Rad, Mat3, Mat4, Quat, Rad2Deg, Vec2, Vec3, Vec4 } from './math.js';

describe("Vec3", () => {
  test("Add", () => {
    const a = Vec3.FromValues(1, 2, 3);
    const b = Vec3.FromValues(1, 2, 3);
    const c = new Vec3();
    Vec3.Add(c, a, b);
    expect(c.values).toEqual(new Float32Array([2, 4, 6]));
  });
  test("Angle", () => {
    let a = Vec3.FromValues(1, 1, 0);
    let b = Vec3.FromValues(-5, -5, 0);
    let c = Vec3.Angle(a, b) * Rad2Deg;
    expect(c).toEqual(180);
    a = Vec3.FromValues(1, 1, 0);
    b = Vec3.FromValues(-50, 50, 0);
    c = Vec3.Angle(a, b) * Rad2Deg;
    expect(c).toEqual(90);
  });
  test("Ceil & Floor", () => {
    let a = Vec3.FromValues(1.1, 2.2, 3.8);
    a.ceil();
    expect(a.values).toEqual(new Float32Array([2, 3, 4]));
    let b = Vec3.FromValues(1.1, 2.2, 3.8);
    b.floor();
    expect(b.values).toEqual(new Float32Array([1, 2, 3]));
  });
  test("Clone & Copy", () => {
    let a = Vec3.FromValues(1.1, 2.2, 3.8);
    let c = Vec3.Create();
    c.copy(a);
    expect(c.values).toEqual(new Float32Array([1.1, 2.2, 3.8]));
    
    let b = Vec3.FromValues(5, 6, 9);
    c = b.clone();
    expect(c.values).toEqual(b.values);
    expect(c.values).not.equal(b.values);
  });
  test("Cross", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 0, 3);
    let c = new Vec3();
    Vec3.Cross(c, a, b);
    expect(c.values).toEqual(new Float32Array([6, 15, -12]));
  });
  test("Distance", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 0, 3);
    expect(Vec3.Distance(a, b)).toEqual(5.385164807134504);
  });
  test("Div", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 22, 3);
    let c = new Vec3();
    Vec3.Div(c, a, b);
    expect(c.values).toEqual(new Float32Array([0.16666666666666666, 0.09090909090909091, 1]));
  });
  test("Dot", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 0, 3);
    expect(Vec3.Dot(a, b)).toEqual(15);
  });
  test("Inverse", () => {
    let a = Vec3.FromValues(1, 2, 3);
    a.inverse();
    expect(a.values).toEqual(new Float32Array([1, 0.5, 0.3333333333333333]));
  });
  test("Length", () => {
    let a = Vec3.FromValues(1, 2, 3);
    expect(a.length()).toEqual(3.7416573867739413);
  });
  test("Lerp", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 0, 3);
    let c = new Vec3();
    Vec3.Lerp(c, a, b, 0.5);
    expect(c.values).toEqual(new Float32Array([3.5, 1, 3]));
  });
  test("Slerp", () => {
    let a = Vec3.FromValues(1, 0, 0);
    let b = Vec3.FromValues(0, 1, 0);
    let c = new Vec3();

    Vec3.Slerp(c, a, b, 0);
    expect(c.values).toEqual(new Float32Array([1, 0, 0]));
    Vec3.Slerp(c, a, b, 0.5);
    expect(c.values).toEqual(new Float32Array([0.7071067811865475, 0.7071067811865475, 0]));
    Vec3.Slerp(c, a, b, 1);
    expect(c.values).toEqual(new Float32Array([0, 1, 0]));
  });
  test("Max & Min", () => {
    let a = Vec3.FromValues(-1, 2, -3);
    let b = Vec3.FromValues(1, -2, 3);
    let c = new Vec3();

    Vec3.Max(c, a, b);
    expect(c.values).toEqual(new Float32Array([1, 2, 3]));
    Vec3.Min(c, a, b);
    expect(c.values).toEqual(new Float32Array([-1, -2, -3]));
  });
  test("Multiply", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(6, 0, 3);
    let c = new Vec3();
    Vec3.Multiply(c, a, b);
    expect(c.values).toEqual(new Float32Array([6, 0, 9]));
  });
  test("Negate", () => {
    let a = Vec3.FromValues(1, 2, 3);
    a.negate();
    expect(a.values).toEqual(new Float32Array([-1, -2, -3]));
  });
  test("Normalize", () => {
    let a = Vec3.FromValues(1, 2, 3);
    a.normalize();
    expect(a.values).toEqual(new Float32Array([0.2672612419124244, 0.5345224838248488, 0.8017837257372732]));
    expect(a.length()).toBeCloseTo(1);
  });
  test("Random", () => {
    let a = new Vec3();
    Vec3.Random(a, 5);
    expect(a.length()).toBeCloseTo(5);
    Vec3.Random(a, 10);
    expect(a.length()).toBeCloseTo(10);
  });
  test("Rotate(XYZ)", () => {
    let origin = Vec3.FromValues(4, 5, 6);
    let a = Vec3.FromValues(1, 2, 3);
    let z = new Vec3();

    Vec3.RotateX(z, a, origin, 30 * Deg2Rad);
    expect(z.values).toEqual(new Float32Array([1, 3.901923788646684, 1.901923788646684]));
    Vec3.RotateY(z, a, origin, 30 * Deg2Rad);
    expect(z.values).toEqual(new Float32Array([-0.09807620942592621,2,4.901923656463623]));
    Vec3.RotateZ(z, a, origin, 30 * Deg2Rad);
    expect(z.values).toEqual(new Float32Array([2.901923894882202,0.9019237756729126,3]));
  });
  test("Round", () => {
    let a = Vec3.FromValues(1.5, -1.5, 3.6);
    a.round();
    expect(a.values).toEqual(new Float32Array([2, -2, 4]));
  });
  test("Scale & ScaleAndAdd & Set", () => {
    let a = Vec3.FromValues(1, 2, 3);
    a.scale(2);
    expect(a.values).toEqual(new Float32Array([2, 4, 6]));

    let b = Vec3.FromValues(1, 2, 3);
    a.scaleAndAdd(b, 5);
    expect(a.values).toEqual(new Float32Array([7, 14, 21]));

    a.set(7, 8, 9);
    expect(a.values).toEqual(new Float32Array([7, 8, 9]));
  });
  test("SquaredDistance & SquaredLength", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(4, 5, 6);
    expect(a.squaredDistance(b)).toEqual(27);
    expect(a.squaredLength()).toEqual(14);
  });
  test("Sub", () => {
    let a = Vec3.FromValues(1, 2, 3);
    let b = Vec3.FromValues(4, 5, 6);
    let c = new Vec3();
    expect(Vec3.Sub(c, b, a).values).toEqual(new Float32Array([3, 3, 3]));
  });
  test("TransformMat3", () => {
    let a = Vec3.FromValues(-1, -2, -3);
    let mat3 = Mat3.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    let c = new Vec3();
    Vec3.TransformMat3(c, a, mat3);
    expect(c.values).toEqual(new Float32Array([-30, -36, -42]));
  });
  test("TransformMat4", () => {
    let a = Vec3.FromValues(-1, -2, -3);
    let mat4 = Mat4.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    let c = new Vec3();
    Vec3.TransformMat4(c, a, mat4);
    expect(c.values).toEqual(new Float32Array([0.625, 0.75, 0.875]));
  });
  test("TransformQuat", () => {
    const quat = Quat.FromValues(0.1276,0.1448,0.2685,0.9437);
    let a = Vec3.FromValues(1, 2, 3);
    a.transformQuat(quat);
    expect(a.values).toEqual(
      new Float32Array([0.8997037353963142, 1.7009999147159816, 3.208912542975964])
    );
  });
  test("Zero", () => {
    let a = Vec3.FromValues(1, 2, 3);
    a.zero();
    expect(a.values).toEqual(
      new Float32Array([0, 0, 0])
    );
  });
});
describe("Vec4", () => {
  test("Add", () => {
    const a = Vec4.FromValues(1, 2, 3, 4);
    const b = Vec4.FromValues(1, 2, 3, 4);
    const c = new Vec4();
    Vec4.Add(c, a, b);
    expect(c.values).toEqual(new Float32Array([2, 4, 6, 8]));
  });
  test("Ceil & Floor", () => {
    let a = Vec4.FromValues(1.1, 2.2, 3.8, 9.1);
    a.ceil();
    expect(a.values).toEqual(new Float32Array([2, 3, 4, 10]));
    let b = Vec4.FromValues(1.1, 2.2, 3.8, 9.3);
    b.floor();
    expect(b.values).toEqual(new Float32Array([1, 2, 3, 9]));
  });
  test("Clone & Copy", () => {
    let a = Vec4.FromValues(1.1, 2.2, 3.8, 9.1);
    let c = Vec4.Create();
    c.copy(a);
    expect(c.values).toEqual(new Float32Array([1.1, 2.2, 3.8, 9.1]));
    
    let b = Vec4.FromValues(5, 6, 9, 2);
    c = b.clone();
    expect(c.values).toEqual(b.values);
    expect(c.values).not.equal(b.values);
  });
  test("Cross", () => {
    let a = new Vec4();
    Vec4.Cross(
      a, Vec4.FromValues(1, 0, 0, 0), Vec4.FromValues(0, 1, 0, 0), Vec4.FromValues(0, 0, 1, 0)
    );
    let b = new Vec4();
    Vec4.Cross(
      b, Vec4.FromValues(1,2,3,4), Vec4.FromValues(5,6,7,8), Vec4.FromValues(9,10,11,13)
    );
    expect(a.values).toEqual(new Float32Array([0, 0, 0, -1]));
    expect(b.values).toEqual(new Float32Array([-4, 8, -4, 0]));
  });
  test("Distance", () => {
    let a = Vec4.FromValues(1, 2, 3, 8);
    let b = Vec4.FromValues(6, 0, 3, 9);
    expect(Vec4.Distance(a, b)).toEqual(5.477225575051661);
  });
  test("Div", () => {
    let a = Vec4.FromValues(1, 2, 3, 6);
    let b = Vec4.FromValues(6, 22, 3, 7);
    let c = new Vec4();
    Vec4.Div(c, a, b);
    expect(c.values).toEqual(new Float32Array([0.16666666666666666, 0.09090909090909091, 1, 0.8571428571428571]));
  });
  test("Dot", () => {
    let a = Vec4.FromValues(1, 2, 3, 8);
    let b = Vec4.FromValues(6, 0, 3, 4);
    expect(Vec4.Dot(a, b)).toEqual(47);
  });
  test("Inverse", () => {
    let a = Vec4.FromValues(1, 2, 3, 9);
    a.inverse();
    expect(a.values).toEqual(new Float32Array([1, 0.5, 0.3333333333333333, 0.1111111111111111]));
  });
  test("Length", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    expect(a.length()).toEqual(5.477225575051661);
  });
  test("Lerp", () => {
    let a = Vec4.FromValues(1, 2, 3, -5);
    let b = Vec4.FromValues(6, 0, 3, 2);
    let c = new Vec4();
    Vec4.Lerp(c, a, b, 0.5);
    expect(c.values).toEqual(new Float32Array([3.5, 1, 3, -1.5]));
  });
  test("Max & Min", () => {
    let a = Vec4.FromValues(-1, 2, -3, 4);
    let b = Vec4.FromValues(1, -2, 3, -4);
    let c = new Vec4();

    Vec4.Max(c, a, b);
    expect(c.values).toEqual(new Float32Array([1, 2, 3, 4]));
    Vec4.Min(c, a, b);
    expect(c.values).toEqual(new Float32Array([-1, -2, -3, -4]));
  });
  test("Multiply", () => {
    let a = Vec4.FromValues(1, 2, 3, 5);
    let b = Vec4.FromValues(6, 0, 3, 6);
    let c = new Vec4();
    Vec4.Multiply(c, a, b);
    expect(c.values).toEqual(new Float32Array([6, 0, 9, 30]));
  });
  test("Negate", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    a.negate();
    expect(a.values).toEqual(new Float32Array([-1, -2, -3, -4]));
  });
  test("Normalize", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    a.normalize();
    expect(a.values).toEqual(new Float32Array([0.18257418583505536,0.3651483716701107,0.5477225575051661,0.7302967433402214]));
    expect(a.length()).toBeCloseTo(1);
  });
  test("Random", () => {
    let a = new Vec4();
    Vec4.Random(a, 5);
    expect(a.length()).toBeCloseTo(5);

    Vec4.Random(a, 10);
    expect(a.length()).toBeCloseTo(10);
  });
  test("Round", () => {
    let a = Vec4.FromValues(1.5, -1.5, 3.6, 6.3);
    a.round();
    expect(a.values).toEqual(new Float32Array([2, -2, 4, 6]));
  });
  test("Scale & ScaleAndAdd & Set", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    a.scale(2);
    expect(a.values).toEqual(new Float32Array([2, 4, 6, 8]));

    let b = Vec4.FromValues(1, 2, 3, 4);
    a.scaleAndAdd(b, 5);
    expect(a.values).toEqual(new Float32Array([7, 14, 21, 28]));

    a.set(7, 8, 9, 10);
    expect(a.values).toEqual(new Float32Array([7, 8, 9, 10]));
  });
  test("SquaredDistance & SquaredLength", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    let b = Vec4.FromValues(5, 6, 7, 8);
    expect(a.squaredDistance(b)).toEqual(64);
    expect(a.squaredLength()).toEqual(30);
  });
  test("Sub", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    let b = Vec4.FromValues(5, 6, 7, 8);
    let c = new Vec4();
    expect(Vec4.Sub(c, b, a).values).toEqual(new Float32Array([4, 4, 4, 4]));
  });
  test("TransformMat4", () => {
    let a = Vec4.FromValues(-1, -2, -3, -4);
    let mat4 = Mat4.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    let c = new Vec4();
    Vec4.TransformMat4(c, a, mat4);
    expect(c.values).toEqual(new Float32Array([-90, -100, -110, -120]));
  });
  test("TransformQuat", () => {
    const quat = Quat.FromValues(0.1276,0.1448,0.2685,0.9437);
    let a = Vec4.FromValues(1, 2, 3, 4);
    a.transformQuat(quat);
    expect(a.values).toEqual(
      new Float32Array([0.8997037353963142, 1.7009999147159816, 3.208912542975964, 4])
    );
  });
  test("Zero", () => {
    let a = Vec4.FromValues(1, 2, 3, 4);
    a.zero();
    expect(a.values).toEqual(
      new Float32Array([0, 0, 0, 0])
    );
  });
});
describe("Quat", () => {
  test("Add", () => {
    const a = Quat.FromValues(1, 2, 3, 4);
    const b = Quat.FromValues(1, 2, 3, 4);
    const c = new Quat();
    Quat.Add(c, a, b);
    expect(c.values).toEqual(new Float32Array([2, 4, 6, 8]));
  });
  test("CalculateW", () => {
    const a = Quat.FromValues(0.1, 0.2, 0.2, 4);
    const c = new Quat();
    Quat.CalculateW(c, a);
    expect(c.values).toEqual(new Float32Array([0.1, 0.2, 0.2, 0.9539392014169457]));
  });
  test("Conjugate", () => {
    const a = Quat.FromValues(0.1, 0.2, 0.2, 4);
    const c = new Quat();
    Quat.Conjugate(c, a);
    expect(c.values).toEqual(new Float32Array([-0.1, -0.2, -0.2, 4]));
  });
  test("Dot", () => {
    let a = Quat.FromValues(1, 2, 3, 8);
    let b = Quat.FromValues(6, 0, 3, 4);
    expect(Quat.Dot(a, b)).toEqual(47);
  });
  test("Exp", () => {
    let a = Quat.FromValues(1, 2, 3, 0);
    a.exp();
    expect(a.values).toEqual(new Float32Array([-0.15092132721996449,-0.30184265443992897,-0.45276398165989346,-0.8252990620752587]));

    let b = Quat.FromValues(1, 2, 3, 4);
    b.exp();
    expect(b.values).toEqual(new Float32Array([-8.240025266756877,-16.480050533513754,-24.72007580027063,-45.05980201339819]));
  });
  test("FromEuler", () => {
    let a = new Quat();
    Quat.FromEuler(a, 10, 20, 30, "xyz");
    expect(a.values).toEqual(new Float32Array([0.12767944069578063,0.14487812541736914,0.2685358227515692,0.943714364147489]));
  
    Quat.FromEuler(a, 10, 20, 30, "xzy");
    expect(a.values).toEqual(new Float32Array([0.03813457647485015,0.14487812541736914,0.2685358227515692,0.9515485246437885]));

    Quat.FromEuler(a, 10, 20, 30, "yzx");
    expect(a.values).toEqual(new Float32Array([0.12767944069578063,0.18930785741199999,0.2392983377447303,0.943714364147489]));

    Quat.FromEuler(a, 10, 20, 30, "zyx");
    expect(a.values).toEqual(new Float32Array([0.03813457647485015,0.18930785741199999,0.2392983377447303,0.9515485246437885]));
  });
  test("FromMat3", () => {
    const mat3 = Mat3.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const a = new Quat();
    Quat.FromMat3(a, mat3);
    const result1 = new Float32Array([0.03471098840236664,-0.0949384868144989,0.024964747950434685,0.7879128456115723]);
    expect(a.values).toEqual(result1);
  });
  test("FromMat3", () => {
    const a = new Quat();
    const b = new Quat();
    const c = new Quat();
    Quat.FromEuler(a, 10, 0, 0);
    Quat.FromEuler(b, 30, 0, 0);
    Quat.FromEuler(c, -330, 0, 0);
    expect(Quat.GetAngle(a, b) * Rad2Deg).toBeCloseTo(20);
    expect(Quat.GetAngle(a, c) * Rad2Deg).toBeCloseTo(20);
  });
  test("GetAxisAngle", () => {
    const a = new Quat();
    Quat.FromEuler(a, 10, 0, 0);
    const axis = new Vec3();
    const angle = Quat.GetAxisAngle(axis, a) * Rad2Deg;
    expect(angle).toBeCloseTo(10);
    expect(axis.values).toEqual(new Float32Array([1, 0, 0]));
  });
  test("Identity", () => {
    const a = new Quat();
    a.identity();
    expect(a.values).toEqual(new Float32Array([0, 0, 0, 1]));
  });
  test("Invert", () => {
    const a = Quat.FromValues(1, 2, 3, 4);
    a.invert();
    expect(a.values).toEqual(new Float32Array([-0.03333333333333333,-0.06666666666666667,-0.1,0.13333333333333333]));
  });
  test("Length", () => {
    let a = Quat.FromValues(1, 2, 3, 4);
    expect(a.length()).toEqual(5.477225575051661);
  });
  test("Lerp", () => {
    let a = Quat.FromValues(1, 2, 3, -5);
    let b = Quat.FromValues(6, 0, 3, 2);
    let c = new Quat();
    Quat.Lerp(c, a, b, 0.5);
    expect(c.values).toEqual(new Float32Array([3.5, 1, 3, -1.5]));
  });
  test("Ln", () => {
    let a = new Quat();
    Quat.FromEuler(a, 10, 20, 30);
    Quat.Ln(a, a);
    expect(a.values).toEqual(new Float32Array([0.13013018667697906,0.14765900373458862,0.27369025349617004,0]));
  });
  test("Multiply", () => {
    let a = Quat.FromValues(1, 2, 3, 4);
    let b = Quat.FromValues(6, 7, 8, 9);
    a.multiply(b);
    expect(a.values).toEqual(new Float32Array([28, 56, 54, -8]));
  });
  test("Normalize", () => {
    let a = Quat.FromValues(1, 2, 3, 4);
    a.normalize();
    expect(a.values).toEqual(new Float32Array([0.18257418583505536,0.3651483716701107,0.5477225575051661,0.7302967433402214]));
    expect(a.length()).toBeCloseTo(1);
  });
  test("Pow", () => {
    let a = new Quat();
    let b = new Quat();
    Quat.FromEuler(a, 30, 0, 0, "xyz");

    Quat.Pow(b, a, 0);
    expect(b.values).toEqual(new Float32Array([0, 0, 0, 1]));
    Quat.Pow(b, a, 1);
    expect(b.values).toEqual(new Float32Array([0.2588191032409668,0,0,0.9659258127212524]));
  });
  test("Random", () => {
    let a = new Quat();
    Quat.Random(a);
    expect(a.length()).toBeCloseTo(1);
  });
  test("Rotate(XYZ)", () => {
    let a = new Quat();
    Quat.FromEuler(a, 10, 20, 30);
    Quat.RotateX(a, a, 10 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([0.20944370329380035,0.16773125529289246,0.25488701462745667,0.9289952516555786]));

    Quat.RotateY(a, a, 20 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([0.1620011180639267,0.32650136947631836,0.2873842120170593,0.8857554793357849]));
  
    Quat.RotateZ(a, a, 30 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([0.24098584055900574,0.2734471261501312,0.5068421959877014,0.7811936140060425]));
  });
  test("Scale & Set", () => {
    let a = Quat.FromValues(1, 2, 3, 4);
    a.scale(2);
    expect(a.values).toEqual(new Float32Array([2, 4, 6, 8]));

    a.set(7, 8, 9, 10);
    expect(a.values).toEqual(new Float32Array([7, 8, 9, 10]));
  });
  test("SetAxisAngle", () => {
    let a = new Quat();
    a.setAxisAngle(Vec3.FromValues(1, 0, 0), 30 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([0.25881904510252074, 0, 0, 0.9659258262890683]));
  });
  test("Slerp", () => {
    let a = new Quat();
    let b = new Quat();
    Quat.FromEuler(a, 30, 0, 0);
    Quat.FromEuler(b, 60, 0, 0);
    let c = new Quat();
    Quat.Slerp(c, a, b, 0.5);
    expect(c.values).toEqual(new Float32Array([0.3826834343019374, 0, 0, 0.92387952429106]));
  });
  test("SquaredLength", () => {
    let a = Quat.FromValues(1, 2, 3, 4);
    expect(a.squaredLength()).toEqual(30);
  });

});
describe("Mat3", () => {
  test("Create", () => {
    const mat3 = Mat3.Create();
    const identityMat3 = Mat3.FromRowValues(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    );
    expect(mat3.values).toEqual(identityMat3.values);
  });
  test("FromValues", () => {
    const mat3 = Mat3.FromValues(
      1, 2, 3,
      -1, -2, -3,
      6, 7, 8,
    );
    const result = new Float32Array([1, 2, 3, -1, -2, -3, 6, 7, 8]);
    expect(mat3.values).toEqual(result);
  });
  test("FromRowValues", () => {
    const mat3 = Mat3.FromRowValues(
      1, 2, 3,
      -1, -2, -3,
      6, 7, 8,
    );
    const result = new Float32Array([1, -1, 6, 2, -2, 7, 3, -3, 8]);
    expect(mat3.values).toEqual(result);
  });
  test("Add", () => {
    const a = Mat3.FromRowValues(
      1,2,3,
      4,5,6,
      7,8,9
    );
    const b = Mat3.FromRowValues(
      -1,-2,-3,
      -4,-5,-6,
      -7,-8,-9
    );
    a.add(b);
    expect(a.values).toEqual(new Float32Array([0,0,0,0,0,0,0,0,0]));
  });
  test("Det", () => {
    const a = Mat3.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const b = Mat3.FromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);
    const c = Mat3.FromValues(1, 2, 3, 0, 1, 2, 0, 2, 0);
    expect(a.det()).toEqual(0);
    expect(b.det()).toEqual(1);
    expect(c.det()).toEqual(-4);
  });
  test("FromMat4", () => {
    const a = Mat4.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12, 13, 14, 15, 16);
    const b = new Mat3();
    Mat3.FromMat4(b, a);
    expect(b.values).toEqual(new Float32Array([1, 2, 3, 5, 6, 7, 9, 10, 11]));
  })
  test("FromQuat", () => {
    const a = Mat3.Create();
    const quat = Quat.FromValues(0.017816031351685524,0.30460426211357117,0.4367034435272217,0.8462794423103333);
    Mat3.FromQuat(a, quat);
    const result = new Float32Array([0.4330126941204071,0.75,-0.5,-0.7282926440238953,0.6179453730583191,0.29619812965393066,0.5311213135719299,0.2358887791633606,0.813797652721405]);
    expect(a.values).toEqual(result);

    const b = Mat3.Create();
    // negative quat
    const quat2 = Quat.FromValues(-0.017816031351685524,-0.30460426211357117,-0.4367034435272217,-0.8462794423103333);
    Mat3.FromQuat(b, quat2);
    expect(a.values).toEqual(b.values);
  });
  test("FromRotation", () => {
    const a = Mat3.Create();
    Mat3.FromRotation(a, 30 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([
      0.8660254037844387,0.49999999999999994,0,-0.49999999999999994,0.8660254037844387,0,0,0,1
    ]));
  });
  test("FromScaling", () => {
    const a = Mat3.Create();
    Mat3.FromScaling(a, Vec2.FromValues(5, 9));
    expect(a.values).toEqual(new Float32Array([
      5,0,0,0,9,0,0,0,1
    ]));
  });
  test("FromTranslation", () => {
    const a = Mat3.Create();
    Mat3.FromTranslation(a, Vec2.FromValues(5, 9));
    expect(a.values).toEqual(new Float32Array([
      1,0,0,0,1,0,5,9,1
    ]));
  });
  test("Identity", () => {
    const a = Mat3.Create();
    Mat3.Identity(a);
    expect(a.values).toEqual(new Float32Array([
      1,0,0,0,1,0,0,0,1
    ]));
  });
  test("Invert", () => {
    const a = Mat3.FromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);
    a.invert();
    expect(a.values).toEqual(new Float32Array([
      1,0,0,0,1,0,0,0,1
    ]));

    const b = Mat3.FromValues(1, 2, 3, 0, 2, 3, 0, 0, 3);
    b.invert();
    expect(b.values).toEqual(new Float32Array([
      1,-1,0,0,0.5,-0.5,0,0,0.3333333333333333
    ]));
  });
  test("Multiply", () => {
    const a = Mat3.FromValues(
      1, 2, 3, 4, 5, 6, 7, 8, 9
    );
    Mat3.Multiply(a, a, a);
    expect(a.values).toEqual(new Float32Array([30,36,42,66,81,96,102,126,150]));
    
    const b = Mat3.FromValues(
      1, -2, 3, -4, 5, -6, 7, -8,-9
    );
    Mat3.Multiply(b, b, b);
    expect(b.values).toEqual(new Float32Array([30,-36,-12,-66,81,12,-24,18,150]));
  });
  test("MultiplyScalar & MultiplyScalarAndAdd", () => {
    const a = Mat3.FromValues(
      1, 2, 3,
      4, 5, 6,
      7, 8, 9,
    );
    Mat3.MultiplyScalar(a, a, 10);
    expect(a.values).toEqual(new Float32Array([
      10,20,30,40,50,60,70,80,90
    ]));

    Mat3.MultiplyScalarAndAdd(a, a, a, 5);
    expect(a.values).toEqual(new Float32Array([
      60,120,180,240,300,360,420,480,540
    ]));
  });
  test("NormalFromMat4", () => {
    const mat4 = new Mat4();
    const quat = new Quat();
    Quat.FromEuler(quat, 10, 20, 30, "xyz");
    const translation = Vec3.FromValues(-3, 5, 6);
    const scale = Vec3.FromValues(1, 2, 3);
    Mat4.FromRotationTranslationScale(mat4, quat, translation, scale);
  
    const a = new Mat3();
    Mat3.NormalFromMat4(a, mat4);
    const result = new Float32Array([
      0.8137976918980658,0.543838162684155,-0.2048741451911713,-0.23492316285208215,0.41158647465016396,0.15939789960110423,0.11400671920181517,-0.054391969143161537,0.30847219975553686
    ]);
    for(let i = 0; i < 9; i++){
      expect(a.values[i]).toBeCloseTo(result[i]);
    }
  });
  test("Projection", () => {
    const a = new Mat3();
    Mat3.Projection(a, 200, 300);
    expect(a.values).toEqual(new Float32Array([
      0.01,0,0,0,-0.006666666666666667,0,-1,1,1
    ]));
  });
  test("Rotate", () => {
    const a = new Mat3();
    Mat3.FromRotation(a, 30 * Deg2Rad);
    a.rotate(20 * Deg2Rad);
    expect(a.values).toEqual(new Float32Array([
      0.6427875757217407,0.7660444378852844,0,-0.7660444378852844,0.6427875757217407,0,0,0,1
    ]));
  });
  test("Scale", () => {
    const a = new Mat3();
    Mat3.FromRotation(a, 30 * Deg2Rad);
    Mat3.Scale(a, a, Vec2.FromValues(2, 3));
    expect(a.values).toEqual(new Float32Array([
      1.7320507764816284,1,0,-1.5,2.598076105117798,0,0,0,1
    ]));
  });
  test("Set", () => {
    const a = new Mat3();
    a.set(1, 2, 3, 4, 5, 6, 7, 8, 9)
    expect(a.values).toEqual(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
  test("Sub", () => {
    const a = Mat3.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    a.sub(a);
    expect(a.values).toEqual(new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]));
  });
  test("Translate", () => {
    const a = new Mat3();
    Mat3.FromRotation(a, 30 * Deg2Rad);
    Mat3.Translate(a, a, Vec2.FromValues(2, 3));
    expect(a.values).toEqual(new Float32Array([
      0.8660253882408142,0.5,0,-0.5,0.8660253882408142,0,0.23205077648162842,3.598076105117798,1
    ]));
  });
  test("Transpose", () => {
    const b = Mat3.FromValues(1, 0, 0, 0, 1, 0, 0, 0, 1);
    const c = Mat3.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9);
    b.transpose();
    c.transpose();
    const result1 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const result2 = new Float32Array([1,4,7,2,5,8,3,6,9]);
    expect(b.values).toEqual(result1);
    expect(c.values).toEqual(result2);

    const d = new Mat3();
    Mat3.Transpose(d, b);
    expect(d.values).toEqual(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));
    Mat3.Transpose(d, c);
    expect(d.values).toEqual(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
});
describe("Mat4", () => {
  test("Create", () => {
    const mat4 = Mat4.Create();
    const identityMat4 = Mat4.FromRowValues(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    expect(mat4.values).toEqual(identityMat4.values);
  });
  test("FromValues", () => {
    const mat4 = Mat4.FromValues(
      1, 2, 3, 4,
      -1, -2, -3, -4,
      6, 7, 8, 9,
      -6, -7, -8, -9
    );
    const result = new Float32Array([1, 2, 3, 4, -1, -2, -3, -4, 6, 7, 8, 9, -6, -7, -8, -9]);
    expect(mat4.values).toEqual(result);
  });
  test("FromRowValues", () => {
    const mat4 = Mat4.FromRowValues(
      1, 2, 3, 4,
      -1, -2, -3, -4,
      6, 7, 8, 9,
      -6, -7, -8, -9
    );
    const result = new Float32Array([1, -1, 6, -6, 2, -2, 7, -7, 3, -3, 8, -8, 4, -4, 9, -9]);
    expect(mat4.values).toEqual(result);
  });
  test("FromQuat", () => {
    const a = Mat4.Create();
    const quat = Quat.FromValues(0.017816031351685524,0.30460426211357117,0.4367034435272217,0.8462794423103333);
    Mat4.FromQuat(a, quat);
    const result = new Float32Array([0.4330126941204071,0.75,-0.5,0,-0.7282926440238953,0.6179453730583191,0.29619812965393066,0,0.5311213135719299,0.2358887791633606,0.813797652721405,0,0,0,0,1]);
    expect(a.values).toEqual(result);

    const b = Mat4.Create();
    // negative quat
    const quat2 = Quat.FromValues(-0.017816031351685524,-0.30460426211357117,-0.4367034435272217,-0.8462794423103333);
    Mat4.FromQuat(b, quat2);
    expect(a.values).toEqual(b.values);
  });
  test("FromRotation", () => {
    const a = Mat4.Create();
    Mat4.FromRotation(a, 30 * Math.PI / 180, Vec3.FromValues(1, 1, 0));
    expect(a.values).toEqual(new Float32Array([0.9330127239227295,0.0669872984290123,-0.3535533845424652,0,0.0669872984290123,0.9330127239227295,0.3535533845424652,0,0.3535533845424652,-0.3535533845424652,0.8660253882408142,0,0,0,0,1]));
  });
  test("FromRotationTranslation", () => {
    const mat4 = Mat4.Create();
    const quat = Quat.FromValues(0.017816031351685524,0.30460426211357117,0.4367034435272217,0.8462794423103333);
    const translate = Vec3.FromValues(-2, 5, 2);
    Mat4.FromRotationTranslation(mat4, quat, translate);
    const result = new Float32Array([0.4330126941204071,0.75,-0.5,0,-0.7282926440238953,0.6179453730583191,0.29619812965393066,0,0.5311213135719299,0.2358887791633606,0.813797652721405,0,-2,5,2,1]);
    expect(mat4.values).toEqual(result);
  });
  test("FromRotationTranslationScale", () => {
    const mat4 = Mat4.Create();
    const quat = Quat.FromValues(0.03988973796367645,0.5811298489570618,0.27709755301475525,0.7641425728797913);
    const translate = Vec3.FromValues(-10, 5, -6);
    const scale = Vec3.FromValues(1, 3, 6);
    Mat4.FromRotationTranslationScale(mat4, quat, translate, scale);
    const result = new Float32Array([0.1710100919008255,0.46984630823135376,-0.866025447845459,0,-1.1313655376434326,2.529754638671875,1.149066686630249,0,5.461432933807373,1.5665785074234009,1.9283628463745117,0,-10,5,-6,1]);
    expect(mat4.values).toEqual(result);
  });
  test("FromScaling", () => {
    const scale = Vec3.FromValues(1, 3, 6);
    const mat4 = new Mat4();
    Mat4.FromScaling(mat4, scale);
    const result = new Float32Array([1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 6, 0, 0, 0, 0, 1]);
    expect(mat4.values).toEqual(result);
  });
  test("FromTranslation", () => {
    const translate = Vec3.FromValues(1, 3, 6);
    const mat4 = new Mat4();
    Mat4.FromTranslation(mat4, translate);
    const result = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 3, 6, 1]);
    expect(mat4.values).toEqual(result);
  });
  test("From(XYZ)Rotation", () => {
    const a = Mat4.FromXRotation(new Mat4(), 15 * Math.PI / 180);
    const b = Mat4.FromYRotation(new Mat4(), 25 * Math.PI / 180);
    const c = Mat4.FromZRotation(new Mat4(), 35 * Math.PI / 180);
    const result1 = new Float32Array([1,0,0,0,0,0.9659258127212524,0.258819043636322,0,0,-0.258819043636322,0.9659258127212524,0,0,0,0,1]);
    const result2 = new Float32Array([0.9063078165054321,0,-0.4226182699203491,0,0,1,0,0,0.4226182699203491,0,0.9063078165054321,0,0,0,0,1]);
    const result3 = new Float32Array([0.8191520571708679,0.5735764503479004,0,0,-0.5735764503479004,0.8191520571708679,0,0,0,0,1,0,0,0,0,1]);
    expect(a.values).toEqual(result1);
    expect(b.values).toEqual(result2);
    expect(c.values).toEqual(result3);
  });
  test("Frustum", () => {
    const a = new Mat4();
    const b = new Mat4();
    Mat4.Frustum(a, -15, 15, -20, 20, 1, 100);
    Mat4.Frustum(b, 0, 30, -30, 30, 100, 1000);
    const result1 = new Float32Array([0.06666667014360428,0,0,0,0,0.05000000074505806,0,0,0,0,-1.0202020406723022,-1,0,0,-2.0202019214630127,0]);
    const result2 = new Float32Array([6.666666507720947,0,0,0,0,3.3333332538604736,0,0,1,0,-1.2222222089767456,-1,0,0,-222.22222900390625,0]);
    expect(a.values).toEqual(result1);
    expect(b.values).toEqual(result2);
  });
  test("GetRotation", () => {
    const mat4 = Mat4.Create();
    const quat = Quat.FromValues(0.03988973796367645,0.5811298489570618,0.27709755301475525,0.7641425728797913);
    const translate = Vec3.FromValues(-10, 5, -6);
    const scale = Vec3.FromValues(1, 3, 6);
    Mat4.FromRotationTranslationScale(mat4, quat, translate, scale);
    const quatOut = new Quat();
    Mat4.GetRotation(quatOut, mat4);
    const result1 = new Float32Array([0.03988974168896675,0.5811298489570618,0.27709755301475525,0.7641425728797913]);
    expect(quatOut.values).toEqual(result1);
  });
  test("GetScaling&GetTranslation&Identity", () => {
    const mat4 = Mat4.Create();
    const quat = Quat.FromValues(0.03988973796367645,0.5811298489570618,0.27709755301475525,0.7641425728797913);
    const translate = Vec3.FromValues(-10, 5, -6);
    const scale = Vec3.FromValues(1, 3, 6);
    Mat4.FromRotationTranslationScale(mat4, quat, translate, scale);
    const scaleOut = new Vec3();
    Mat4.GetScaling(scaleOut, mat4);
    const result1 = new Float32Array([1, 3.000000238418579, 6]);
    expect(scaleOut.values).toEqual(result1);

    const translateOut = new Vec3();
    Mat4.GetTranslation(translateOut, mat4);
    const result2 = new Float32Array([-10, 5, -6]);
    expect(translateOut.values).toEqual(result2);

    Mat4.Identity(mat4);
    expect(mat4.values).toEqual(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  });
  test("LookAt", () => {
    let mat4 = Mat4.Create();
    Mat4.LookAt(mat4, Vec3.FromValues(1,2,3), Vec3.FromValues(0,0,0), Vec3.FromValues(0,1,0));
    expect(mat4.values).toEqual(new Float32Array([0.9486833214759827,-0.16903084516525269,0.26726123690605164,0,0,0.8451542258262634,0.5345224738121033,0,-0.3162277638912201,-0.5070925354957581,0.8017837405204773,0,-0,-0,-3.7416574954986572,1]));

    mat4 = Mat4.Create();
    Mat4.LookAt(mat4, Vec3.FromValues(1,2,3), Vec3.FromValues(-2,1,5), Vec3.FromValues(0,1,0));
    expect(mat4.values).toEqual(new Float32Array([-0.5547001957893372,-0.2223747968673706,0.8017837405204773,0,0,0.963624119758606,0.26726123690605164,0,-0.8320503234863281,0.14824986457824707,-0.5345224738121033,0,3.0508511066436768,-2.149622917175293,0.26726123690605164,1]))
  });
  test("Multiply", () => {
    const a = Mat4.FromValues(
      1, 2, 3, 4, 5, 6, 7, 8,
      9, 10, 11, 12, 13, 14, 15, 16
    );
    Mat4.Multiply(a, a, a);
    expect(a.values).toEqual(new Float32Array([90,100,110,120,202,228,254,280,314,356,398,440,426,484,542,600]));
    
    const b = Mat4.FromValues(
      1, -2, 3, -4, 5, -6, 7, -8,
      -9, 10, -11, 12, -13, 14, -15, 16
    );
    Mat4.Multiply(b, b, b);
    expect(b.values).toEqual(new Float32Array([16,-16,16,-16,16,-16,16,-16,-16,16,-16,16,-16,16,-16,16]));
  });
  test("Add & MultiplyScalar & Sub", () => {
    const a = Mat4.FromRowValues(
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    );
    const b = new Mat4();
    Mat4.MultiplyScalar(b, a, -1);
    a.add(b);
    const result = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(a.values).toEqual(result);

    const c = Mat4.FromRowValues(
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    );
    a.sub(c);
    const result2 = new Float32Array([-1, -5, -9, -13, -2, -6, -10, -14, -3, -7, -11, -15, -4, -8, -12, -16]);
    expect(a.values).toEqual(result2);
  });
  test("MultiplyScalarAndAdd", () => {
    const a = Mat4.FromValues(
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    );
    Mat4.MultiplyScalarAndAdd(a, a, a, 10);
    expect(a.values).toEqual(new Float32Array([
      11,22,33,44,55,66,77,88,99,110,121,132,143,154,165,176
    ]));
  });
  test("OrthoNO", () => {
    const a = new Mat4();
    const b = new Mat4();
    Mat4.OrthoNO(a, -15, 15, -20, 20, 1, 100);
    Mat4.OrthoNO(b, 0, 30, -30, 30, 100, 1000);
    const result1 = new Float32Array([0.06666667014360428,0,0,0,0,0.05000000074505806,0,0,0,0,-0.020202020183205605,0,-0,-0,-1.0202020406723022,1]);
    const result2 = new Float32Array([0.06666667014360428,0,0,0,0,0.03333333507180214,0,0,0,0,-0.002222222276031971,0,-1,-0,-1.2222222089767456,1]);
    expect(a.values).toEqual(result1);
    expect(b.values).toEqual(result2);
  });
  test("PerspectiveNO", () => {
    const a = new Mat4();
    Mat4.PerspectiveNO(a, 30 * Math.PI / 180, 19/7, 1, 100);
    const result1 = new Float32Array([1.3749661445617676,0,0,0,0,3.732050895690918,0,0,0,0,-1.0202020406723022,-1,0,0,-2.0202019214630127,0]);
    expect(a.values).toEqual(result1);
  });
  test("Rotate", () => {
    const a = Mat4.Create();
    Mat4.Rotate(a, a, 30 * Math.PI / 180, Vec3.FromValues(1, 1, 0));
    const result1 = new Float32Array([0.9330127239227295,0.0669872984290123,-0.3535533845424652,0,0.0669872984290123,0.9330127239227295,0.3535533845424652,0,0.3535533845424652,-0.3535533845424652,0.8660253882408142,0,0,0,0,1]);
    expect(a.values).toEqual(result1);

    Mat4.Rotate(a, a, -45 * Math.PI / 180, Vec3.FromValues(0, 0, 1));
    const result2 = new Float32Array([0.6123724579811096,-0.6123724579811096,-0.5,0,0.7071067690849304,0.7071067690849304,2.7755575615628914e-17,0,0.3535533845424652,-0.3535533845424652,0.8660253882408142,0,0,0,0,1]);
    expect(a.values).toEqual(result2);
  });
  test("Rotate(XYZ)&Scale", () => {
    const a = Mat4.Create();
    Mat4.RotateX(a, a, 30 * Math.PI / 180);
    const result1 = new Float32Array([1,0,0,0,0,0.8660253882408142,0.5,0,0,-0.5,0.8660253882408142,0,0,0,0,1]);
    expect(a.values).toEqual(result1);

    Mat4.RotateX(a, a, -45 * Math.PI / 180);
    const result2 = new Float32Array([1,0,0,0,0,0.9659258127212524,-0.258819043636322,0,0,0.258819043636322,0.9659258127212524,0,0,0,0,1]);
    expect(a.values).toEqual(result2);

    Mat4.RotateY(a, a, -45 * Math.PI / 180);
    const result3 = new Float32Array([0.7071067690849304,0.1830126941204071,0.6830126643180847,0,0,0.9659258127212524,-0.258819043636322,0,-0.7071067690849304,0.1830126941204071,0.6830126643180847,0,0,0,0,1]);
    expect(a.values).toEqual(result3);

    Mat4.RotateZ(a, a, 25 * Math.PI / 180);
    const result4 = new Float32Array([0.6408563852310181,0.5740837454795837,0.5096380710601807,0,-0.29883623123168945,0.7980815768241882,-0.523223340511322,0,-0.7071067690849304,0.1830126941204071,0.6830126643180847,0,0,0,0,1]);
    expect(a.values).toEqual(result4);

    Mat4.Scale(a, a, Vec3.FromValues(4, 5, 6));
    const result5 = new Float32Array([2.5634255409240723,2.296334981918335,2.0385522842407227,0,-1.4941811561584473,3.990407943725586,-2.616116762161255,0,-4.242640495300293,1.0980761051177979,4.098075866699219,0,0,0,0,1]);
    expect(a.values).toEqual(result5);
  });
  test("TargetTo & Translate", () => {
    const a = Mat4.Create();
    Mat4.TargetTo(a, Vec3.FromValues(5, 3, 2), Vec3.FromValues(-1, 1, -5), Vec3.FromValues(0, 1, 0));
    const result = new Float32Array([0.7592566013336182,0,-0.650791347026825,0,-0.13796749711036682,0.9772697687149048,-0.1609620749950409,0,0.6359987258911133,0.2119995802640915,0.7419984936714172,0,5,3,2,1]);
    expect(a.values).toEqual(result);

    const b = Mat4.Create();
    Mat4.Translate(b, a, Vec3.FromValues(2, 3, 4));
    const result1 = new Float32Array([0.7592566013336182,0,-0.650791347026825,0,-0.13796749711036682,0.9772697687149048,-0.1609620749950409,0,0.6359987258911133,0.2119995802640915,0.7419984936714172,0,8.648605346679688,6.7798075675964355,3.1835250854492188,1]);
    expect(b.values).toEqual(result1);
  });
  test("Det", () => {
    const a = Mat4.FromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
    const b = Mat4.FromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    const c = Mat4.FromValues(1, 2, 3, 4, 0, 2, 3, 4, 0, 0, 3, 4, 0, 0, 0, 4);
    expect(a.det()).toEqual(0);
    expect(b.det()).toEqual(1);
    expect(c.det()).toEqual(24);
  });
  test("Invert", () => {
    const b = Mat4.FromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    const c = Mat4.FromValues(1, 2, 3, 4, 0, 2, 3, 4, 0, 0, 3, 4, 0, 0, 0, 4);
    b.invert();
    c.invert();
    const result1 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const result2 = new Float32Array([1,-1,0,0,0,0.5,-0.5,0,0,0,0.3333333432674408,-0.3333333432674408,0,0,0,0.25]);
    expect(b.values).toEqual(result1);
    expect(c.values).toEqual(result2);
  });
  test("Transpose", () => {
    const b = Mat4.FromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    const c = Mat4.FromValues(1, 2, 3, 4, 0, 2, 3, 4, 0, 0, 3, 4, 0, 0, 0, 4);
    b.transpose();
    c.transpose();
    const result1 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const result2 = new Float32Array([1,0,0,0,2,2,0,0,3,3,3,0,4,4,4,4]);
    expect(b.values).toEqual(result1);
    expect(c.values).toEqual(result2);
  });
});
