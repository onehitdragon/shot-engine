import type * as ShotEngineType from "@shot-engine/types";
import * as math from "@shot-engine/math";
import {
    Vec3, Vec4,
    SceneNode, GameObject, GameObjectPrefab, Component, Transform, MeshRenderer, SkinnedMeshRenderer,
    PointLight, DirectionalLight,
    TransformEditor,
    SkyBox,
    SpotLight,
    LightShadow,
    UILayout,
    TextOrString,
    Text,
    String,
    Camera,
} from "../fbs-gen/fbsengine.js";
import { Builder, Offset } from "flatbuffers";

export function buildSceneNode(builder: Builder, sceneNode: ShotEngineType.SceneNode): Offset{
    if("prefabRef" in sceneNode){
        const goPrefab = sceneNode;
        const idOffset = builder.createString(goPrefab.id);
        const prefabRefOffset = builder.createString(goPrefab.prefabRef);
        GameObjectPrefab.startGameObjectPrefab(builder);
        GameObjectPrefab.addId(builder, idOffset);
        GameObjectPrefab.addPrefabRef(builder, prefabRefOffset);
        const goPrefabOffset = GameObjectPrefab.endGameObjectPrefab(builder);
        return goPrefabOffset;
    }
    const go = sceneNode;
    const childOffsets: Offset[] = [];
    const childTypeOffsets: SceneNode[] = [];
    for(const child of go.childs){
        const sceneNodeOffset = buildSceneNode(builder, child);
        if("prefabRef" in child){
            childTypeOffsets.push(SceneNode.GameObjectPrefab);
        }
        else{
            childTypeOffsets.push(SceneNode.GameObject);
        }
        childOffsets.push(sceneNodeOffset);
    }
    const componentOffsets: Offset[] = [];
    const componentTypeOffsets: Component[] = [];
    for(const component of go.components){
        let componentOffset: number | undefined;
        if(component.type === "Transform"){
            const posOffset = buildVec3(builder, component.pos);
            const rotOffset = buildVec4(builder, component.rot);
            const scaleOffset = buildVec3(builder, component.scale);
            const eulerOffset = buildVec3(builder, component.editor.euler);
            TransformEditor.startTransformEditor(builder);
            TransformEditor.addEuler(builder, eulerOffset);
            const editorOffset = TransformEditor.endTransformEditor(builder);

            const idOffset = builder.createString(component.id);
            Transform.startTransform(builder);
            Transform.addId(builder, idOffset);
            Transform.addPos(builder, posOffset);
            Transform.addRot(builder, rotOffset);
            Transform.addScale(builder, scaleOffset);
            Transform.addEditor(builder, editorOffset);
            componentOffset = Transform.endTransform(builder);
            componentTypeOffsets.push(Component.Transform);
        }
        else if(component.type === "MeshRenderer"){
            const idOffset = builder.createString(component.id);
            const meshRefOffset = builder.createString(component.meshRef);
            const materialRefOffsets: Offset[] = [];
            for(const materialRef of component.materialRefs){
                const materialRefOffset = builder.createString(materialRef);
                materialRefOffsets.push(materialRefOffset);
            }
            const materialRefsOffset = MeshRenderer.createMaterialRefsVector(builder, materialRefOffsets);
            MeshRenderer.startMeshRenderer(builder);
            MeshRenderer.addId(builder, idOffset);
            MeshRenderer.addMeshRef(builder, meshRefOffset);
            MeshRenderer.addMaterialRefs(builder, materialRefsOffset);
            componentOffset = MeshRenderer.endMeshRenderer(builder);
            componentTypeOffsets.push(Component.MeshRenderer);
        }
        else if(component.type === "SkinnedMeshRenderer"){
            const idOffset = builder.createString(component.id);
            const meshRefOffset = builder.createString(component.meshRef);
            const materialRefOffsets: Offset[] = [];
            for(const materialRef of component.materialRefs){
                const materialRefOffset = builder.createString(materialRef);
                materialRefOffsets.push(materialRefOffset);
            }
            const materialRefsOffset = SkinnedMeshRenderer.createMaterialRefsVector(builder, materialRefOffsets);
            const jointRefOffsets: Offset[] = [];
            for(const jointRef of component.jointRefs){
                const jointRefOffset = builder.createString(jointRef);
                jointRefOffsets.push(jointRefOffset);
            }
            const jointRefsOffset = SkinnedMeshRenderer.createJointRefsVector(builder, jointRefOffsets);
            SkinnedMeshRenderer.startSkinnedMeshRenderer(builder);
            SkinnedMeshRenderer.addId(builder, idOffset);
            SkinnedMeshRenderer.addMeshRef(builder, meshRefOffset);
            SkinnedMeshRenderer.addMaterialRefs(builder, materialRefsOffset);
            SkinnedMeshRenderer.addJointRefs(builder, jointRefsOffset);
            componentOffset = SkinnedMeshRenderer.endSkinnedMeshRenderer(builder);
            componentTypeOffsets.push(Component.SkinnedMeshRenderer);
        }
        else if(component.type === "Light" && component.lightType === "DirectionalLight"){
            const idOffset = builder.createString(component.id);
            const colorOffset = buildVec3(builder, component.color);
            const lightShadowOffset = buildLightShadow(builder, component.shadow);
            DirectionalLight.startDirectionalLight(builder);
            DirectionalLight.addId(builder, idOffset);
            DirectionalLight.addColor(builder, colorOffset);
            DirectionalLight.addIntensity(builder, component.intensity);
            DirectionalLight.addShadow(builder, lightShadowOffset);
            componentOffset = DirectionalLight.endDirectionalLight(builder);
            componentTypeOffsets.push(Component.DirectionalLight);
        }
        else if(component.type === "Light" && component.lightType === "PointLight"){
            const idOffset = builder.createString(component.id);
            const colorOffset = buildVec3(builder, component.color);
            const lightShadowOffset = buildLightShadow(builder, component.shadow);
            PointLight.startPointLight(builder);
            PointLight.addId(builder, idOffset);
            PointLight.addColor(builder, colorOffset);
            PointLight.addIntensity(builder, component.intensity);
            PointLight.addRadius(builder, component.radius);
            PointLight.addShadow(builder, lightShadowOffset);
            componentOffset = PointLight.endPointLight(builder);
            componentTypeOffsets.push(Component.PointLight);
        }
        else if(component.type === "Light" && component.lightType === "SpotLight"){
            const idOffset = builder.createString(component.id);
            const colorOffset = buildVec3(builder, component.color);
            const lightShadowOffset = buildLightShadow(builder, component.shadow);
            SpotLight.startSpotLight(builder);
            SpotLight.addId(builder, idOffset);
            SpotLight.addColor(builder, colorOffset);
            SpotLight.addIntensity(builder, component.intensity);
            SpotLight.addRadius(builder, component.radius);
            SpotLight.addInnerAngle(builder, component.innerAngle);
            SpotLight.addOuterAngle(builder, component.outerAngle);
            SpotLight.addShadow(builder, lightShadowOffset);
            componentOffset = SpotLight.endSpotLight(builder);
            componentTypeOffsets.push(Component.SpotLight);
        }
        else if(component.type === "Camera"){
            const idOffset = builder.createString(component.id);
            Camera.startCamera(builder);
            Camera.addId(builder, idOffset);
            Camera.addFovy(builder, component.fovy);
            componentOffset = Camera.endCamera(builder);
            componentTypeOffsets.push(Component.Camera);
        }
        else if(component.type === "SkyBox"){
            const idOffset = builder.createString(component.id);
            const hdrRefOffset = builder.createString(component.hdrRef);
            SkyBox.startSkyBox(builder);
            SkyBox.addId(builder, idOffset);
            SkyBox.addHdrRef(builder, hdrRefOffset);
            componentOffset = SkyBox.endSkyBox(builder);
            componentTypeOffsets.push(Component.SkyBox);
        }
        else if(component.type === "UILayout"){
            const idOffset = builder.createString(component.id);
            let textOrStringOffset_html: number;
            let textOrString_html: TextOrString;
            if(component.html.type === "text"){
                const textRefOffset = builder.createString(component.html.textRef);
                Text.startText(builder);
                Text.addTextRef(builder, textRefOffset);
                textOrStringOffset_html = Text.endText(builder);
                textOrString_html = TextOrString.Text;
            }
            else{
                const valueOffset = builder.createString(component.html.value);
                String.startString(builder);
                String.addValue(builder, valueOffset);
                textOrStringOffset_html = String.endString(builder);
                textOrString_html = TextOrString.String;
            }

            let textOrStringOffset_css: number;
            let textOrString_css: TextOrString;
            if(component.css.type === "text"){
                const textRefOffset = builder.createString(component.css.textRef);
                Text.startText(builder);
                Text.addTextRef(builder, textRefOffset);
                textOrStringOffset_css = Text.endText(builder);
                textOrString_css = TextOrString.Text;
            }
            else{
                const valueOffset = builder.createString(component.css.value);
                String.startString(builder);
                String.addValue(builder, valueOffset);
                textOrStringOffset_css = String.endString(builder);
                textOrString_css = TextOrString.String;
            }

            let textOrStringOffset_js: number;
            let textOrString_js: TextOrString;
            if(component.js.type === "text"){
                const textRefOffset = builder.createString(component.js.textRef);
                Text.startText(builder);
                Text.addTextRef(builder, textRefOffset);
                textOrStringOffset_js = Text.endText(builder);
                textOrString_js = TextOrString.Text;
            }
            else{
                const valueOffset = builder.createString(component.js.value);
                String.startString(builder);
                String.addValue(builder, valueOffset);
                textOrStringOffset_js = String.endString(builder);
                textOrString_js = TextOrString.String;
            }

            UILayout.startUILayout(builder);
            UILayout.addId(builder, idOffset);
            UILayout.addHtml(builder, textOrStringOffset_html);
            UILayout.addHtmlType(builder, textOrString_html);
            UILayout.addCss(builder, textOrStringOffset_css);
            UILayout.addCssType(builder, textOrString_css);
            UILayout.addJs(builder, textOrStringOffset_js);
            UILayout.addJsType(builder, textOrString_js);

            componentOffset = UILayout.endUILayout(builder);
            componentTypeOffsets.push(Component.UILayout);
        }

        if(componentOffset !== undefined){
            componentOffsets.push(componentOffset);
        }
    }
    const idOffset = builder.createString(go.id);
    const nameOffset = builder.createString(go.name);
    const componentsOffset = GameObject.createComponentsVector(builder, componentOffsets);
    const componentTypesOffset = GameObject.createComponentsTypeVector(builder, componentTypeOffsets);
    const childsOffset = GameObject.createChildsVector(builder, childOffsets);
    const childTypesOffset = GameObject.createChildsTypeVector(builder, childTypeOffsets);
    GameObject.startGameObject(builder);
    GameObject.addId(builder, idOffset);
    GameObject.addName(builder, nameOffset);
    GameObject.addComponents(builder, componentsOffset);
    GameObject.addComponentsType(builder, componentTypesOffset);
    GameObject.addChilds(builder, childsOffset);
    GameObject.addChildsType(builder, childTypesOffset);
    const goOffset = GameObject.endGameObject(builder);
    return goOffset;
}

function buildLightShadow(builder: Builder, shadow: ShotEngineType.LightShadow){
    const softShadowOffset = builder.createString(shadow.softShadow);
    LightShadow.startLightShadow(builder);
    LightShadow.addEnable(builder, shadow.enable);
    LightShadow.addBias(builder, shadow.bias);
    LightShadow.addNormalBias(builder, shadow.normalBias);
    LightShadow.addMapSize(builder, shadow.mapSize);
    LightShadow.addSoftShadow(builder, softShadowOffset);
    return LightShadow.endLightShadow(builder);
}

export function readGameObject(gameObject: GameObject){
    const gameObjectResult: ShotEngineType.GameObject = {
        id: gameObject.id() ?? "",
        name: gameObject.name() ?? "",
        components: [],
        childs: []
    }
    
    for(let i = 0; i < gameObject.componentsLength(); i++){
        const componentType = gameObject.componentsType(i);
        if(componentType === Component.Transform){
            const transform = gameObject.components(i, new Transform()) as Transform;
            gameObjectResult.components.push({
                type: "Transform",
                id: transform.id() ?? "",
                pos: getVec3(transform.pos()),
                rot: getQuat(transform.rot()),
                scale: getVec3(transform.scale()),
                editor: {
                    euler: getVec3(transform.editor()?.euler())
                }
            });
        }
        if(componentType === Component.MeshRenderer){
            const meshRenderer = gameObject.components(i, new MeshRenderer()) as MeshRenderer;
            const materialRefs: (string | undefined)[] = [];
            for(let i = 0; i < meshRenderer.materialRefsLength(); i++){
                materialRefs.push(meshRenderer.materialRefs(i) || undefined);
            }
            gameObjectResult.components.push({
                type: "MeshRenderer",
                id: meshRenderer.id() ?? "",
                meshRef: meshRenderer.meshRef() || undefined,
                materialRefs,
            });
        }
        if(componentType === Component.SkinnedMeshRenderer){
            const skinnedMeshRenderer = gameObject.components(i, new SkinnedMeshRenderer()) as SkinnedMeshRenderer;
            const materialRefs: (string | undefined)[] = [];
            for(let i = 0; i < skinnedMeshRenderer.materialRefsLength(); i++){
                materialRefs.push(skinnedMeshRenderer.materialRefs(i) || undefined);
            }
            const jointRefs: (string | undefined)[] = [];
            for(let i = 0; i < skinnedMeshRenderer.jointRefsLength(); i++){
                jointRefs.push(skinnedMeshRenderer.jointRefs(i) || undefined);
            }
            gameObjectResult.components.push({
                type: "SkinnedMeshRenderer",
                id: skinnedMeshRenderer.id() ?? "",
                meshRef: skinnedMeshRenderer.meshRef() || undefined,
                materialRefs,
                jointRefs,
            });
        }
        function readShawdowLight(lightShadow: LightShadow): ShotEngineType.LightShadow {
            const softShadow = lightShadow.softShadow() as ShotEngineType.LightShadow["softShadow"] | null;
            return {
                enable: lightShadow.enable(),
                bias: lightShadow.bias(),
                normalBias: lightShadow.normalBias(),
                mapSize: lightShadow.mapSize(),
                softShadow: softShadow ?? "hard"
            }
        }
        if(componentType === Component.DirectionalLight){
            const directionalLight = gameObject.components(i, new DirectionalLight()) as DirectionalLight;
            const shadow = directionalLight.shadow();
            if(!shadow) continue;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "DirectionalLight",
                id: directionalLight.id() ?? "",
                color: getVec3(directionalLight.color()),
                intensity: directionalLight.intensity(),
                shadow: readShawdowLight(shadow)
            });
        }
        if(componentType === Component.PointLight){
            const pointLight = gameObject.components(i, new PointLight()) as PointLight;
            const shadow = pointLight.shadow();
            if(!shadow) continue;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "PointLight",
                id: pointLight.id() ?? "",
                color: getVec3(pointLight.color()),
                intensity: pointLight.intensity(),
                radius: pointLight.radius(),
                shadow: readShawdowLight(shadow)
            });
        }
        if(componentType === Component.SpotLight){
            const spotLight = gameObject.components(i, new SpotLight()) as SpotLight;
            const shadow = spotLight.shadow();
            if(!shadow) continue;
            gameObjectResult.components.push({
                type: "Light",
                lightType: "SpotLight",
                id: spotLight.id() ?? "",
                color: getVec3(spotLight.color()),
                intensity: spotLight.intensity(),
                radius: spotLight.radius(),
                innerAngle: spotLight.innerAngle(),
                outerAngle: spotLight.outerAngle(),
                shadow: readShawdowLight(shadow)
            });
        }
        if(componentType === Component.Camera){
            const camera = gameObject.components(i, new Camera()) as Camera;
            gameObjectResult.components.push({
                type: "Camera",
                id: camera.id() ?? "",
                fovy: camera.fovy()
            });
        }
        if(componentType === Component.SkyBox){
            const skyBox = gameObject.components(i, new SkyBox()) as SkyBox;
            gameObjectResult.components.push({
                type: "SkyBox",
                id: skyBox.id() ?? "",
                hdrRef: skyBox.hdrRef() ?? ""
            });
        }
        if(componentType === Component.UILayout){
            const uiLayout = gameObject.components(i, new UILayout()) as UILayout;

            const htmlType = uiLayout.htmlType();
            let html: Text | String;
            let htmlOut: ShotEngineType.UILayout["html"];
            if(htmlType === TextOrString.Text){
                html = uiLayout.html(new Text()) as Text;
                htmlOut = {
                    type: "text",
                    textRef: html.textRef() ?? ""
                }
            }
            else{
                html = uiLayout.html(new String()) as String;
                htmlOut = {
                    type: "string",
                    value: html.value() ?? ""
                }
            }

            const cssType = uiLayout.cssType();
            let css: Text | String;
            let cssOut: ShotEngineType.UILayout["css"];
            if(cssType === TextOrString.Text){
                css = uiLayout.css(new Text()) as Text;
                cssOut = {
                    type: "text",
                    textRef: css.textRef() ?? ""
                }
            }
            else{
                css = uiLayout.css(new String()) as String;
                cssOut = {
                    type: "string",
                    value: css.value() ?? ""
                }
            }

            const jsType = uiLayout.jsType();
            let js: Text | String;
            let jsOut: ShotEngineType.UILayout["js"];
            if(jsType === TextOrString.Text){
                js = uiLayout.js(new Text()) as Text;
                jsOut = {
                    type: "text",
                    textRef: js.textRef() ?? ""
                }
            }
            else{
                js = uiLayout.js(new String()) as String;
                jsOut = {
                    type: "string",
                    value: js.value() ?? ""
                }
            }

            gameObjectResult.components.push({
                type: "UILayout",
                id: uiLayout.id() ?? "",
                html: htmlOut,
                css: cssOut,
                js: jsOut
            });
        }
    }

    for(let i = 0; i < gameObject.childsLength(); i++){
        const childType = gameObject.childsType(i);
        if(childType === SceneNode.GameObject){
            const go = gameObject.childs(i, new GameObject()) as GameObject;
            gameObjectResult.childs.push(readGameObject(go));
        }
        if(childType === SceneNode.GameObjectPrefab){
            const goPrefab = gameObject.childs(i, new GameObjectPrefab()) as GameObjectPrefab;
            gameObjectResult.childs.push({
                id: goPrefab.id() ?? "",
                prefabRef: goPrefab.prefabRef() ?? ""
            });
        }
    }

    return gameObjectResult;
}

/** vec3 is pure property object */
export function buildVec3(builder: Builder, vec3: math.Vec3){
    Vec3.startVec3(builder);
    Vec3.addX(builder, vec3.values[0]);
    Vec3.addY(builder, vec3.values[1]);
    Vec3.addZ(builder, vec3.values[2]);
   return Vec3.endVec3(builder);
}
/** vec4 is pure property object */
export function buildVec4(builder: Builder, vec4: math.Vec4 | math.Quat){
    Vec4.startVec4(builder);
    Vec4.addX(builder, vec4.values[0]);
    Vec4.addY(builder, vec4.values[1]);
    Vec4.addZ(builder, vec4.values[2]);
    Vec4.addW(builder, vec4.values[3]);
    return Vec4.endVec4(builder);
}
export function getVec3(vec3?: Vec3 | null): math.Vec3{
    if(!vec3) return math.Vec3.FromValues(0, 0, 0);
    return math.Vec3.FromValues(vec3.x(), vec3.y(), vec3.z());
}
export function getVec4(vec4?: Vec4 | null): math.Vec4{
    if(!vec4) return math.Vec4.FromValues(0, 0, 0, 0);
    return math.Vec4.FromValues(vec4.x(), vec4.y(), vec4.z(), vec4.w());
}
export function getQuat(vec4?: Vec4 | null): math.Quat{
    if(!vec4) return math.Quat.FromValues(0, 0, 0, 1);
    return math.Quat.FromValues(vec4.x(), vec4.y(), vec4.z(), vec4.w());
}
export function getUint8Array(arrayIn?: Uint8Array | null){
    // create new Uint8Array by copy arrayIn
    return arrayIn ? new Uint8Array(arrayIn) : new Uint8Array();
}
export function getFloat32Array(arrayIn?: Float32Array | null){
    // create new Float32Array by copy arrayIn
    return arrayIn ? new Float32Array(arrayIn) : new Float32Array();
}
