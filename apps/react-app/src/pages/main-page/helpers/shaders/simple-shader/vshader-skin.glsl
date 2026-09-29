#version 300 es

uniform mat4 u_vpMatrix;
uniform mat4 u_invBindPoseMatrix[64];
uniform mat4 u_jointMatrix[64];
in vec4 a_Position;
in vec4 a_Weight; // 4 weight
in uvec4 a_Joint; // 4 joint

void main(){
  mat4 skinMatrix = 
    a_Weight.x * (u_jointMatrix[a_Joint.x] * u_invBindPoseMatrix[a_Joint.x])
  + a_Weight.y * (u_jointMatrix[a_Joint.y] * u_invBindPoseMatrix[a_Joint.y])
  + a_Weight.z * (u_jointMatrix[a_Joint.z] * u_invBindPoseMatrix[a_Joint.z])
  + a_Weight.w * (u_jointMatrix[a_Joint.w] * u_invBindPoseMatrix[a_Joint.w]);

  gl_Position = u_vpMatrix * (skinMatrix * a_Position);
}