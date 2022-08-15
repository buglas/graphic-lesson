import React, { useRef, useEffect } from "react"
import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	CircleGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	DodecahedronGeometry,
	EdgesGeometry,
	IcosahedronGeometry,
	InterleavedBufferAttribute,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	OctahedronGeometry,
	PerspectiveCamera,
	PolyhedronGeometry,
	Scene,
	SphereGeometry,
	TetrahedronGeometry,
	TextureLoader,
	TorusGeometry,
	TorusKnotGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
	WireframeGeometry,
} from "three"
import "./fullScreen.css"
import Stage from "../component/Stage"
import Loop from "../component/Loop"

const stage = new Stage(0,0,8)
const { scene, renderer } = stage

/* 初始几何体 */
const originGeo=new BufferGeometry()

// 几何1
/* originGeo.setAttribute(
  'position',
  new BufferAttribute(
    new Float32Array([
      0, 2, -1,
      -1, 0, 1,
      1, 0, 1,
      0, -2, -1,
    ]),
    3
  )
)
originGeo.setIndex([
  0,1,2,
  2,1,3
]) */

// 几何2
/* originGeo.setAttribute(
  'position',
  new BufferAttribute(
    new Float32Array([
      -1, 1, 1,
      -1, -1, 1,
      1, 1, 1,
      1, -1, 1,

      -1, 1, -1,
      -1, -1, -1,
      1, 1, -1,
      1, -1, -1,
    ]),
    3
  )
)
originGeo.setIndex([
  // 前
  0,1,2,2,1,3,
  // 后
  6,7,4,4,7,5,
  // 左
  4,5,0,0,5,1,
  // 右
  2,3,6,6,3,7,
  // 上
  4,0,6,6,0,2,
  // 下
  1,5,3,3,5,7
]) */

// 几何3
const ang=Math.PI*2/3
const r=3
const c=Math.cos(ang)*r
const s=Math.sin(ang)*r
originGeo.setAttribute(
  'position',
  new BufferAttribute(
    new Float32Array([
      0,r,0,
      c,0,s,
      r,0,0,
      c,0,-s,
      0,-r,0,
    ]),
    3
  )
)
originGeo.setIndex([
  0,1,2,2,1,4,
  0,2,3,3,2,4,
  0,3,1,1,3,4
])

// 几何4
/* originGeo.setAttribute(
  'position',
  new BufferAttribute(
    new Float32Array([
      0, 2, 1,
      -1, 0, 1,
      1, 0, 1,
    ]),
    3
  )
)
originGeo.setIndex([
  0,1,2,
]) */


originGeo.computeVertexNormals()
const loop=new Loop(originGeo,3)


// Loop几何体
const geometry = loop.geometry

{
	const material = new MeshNormalMaterial({
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	})
	const cube = new Mesh(geometry, material)
	scene.add(cube)
}
{
	const material = new MeshBasicMaterial({
		wireframe: true,
	})
	const cube = new Mesh(geometry, material)
	scene.add(cube)
}
const LoopSubdivision: React.FC = (): JSX.Element => {
	const divRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const { current } = divRef
		if (current) {
			current.innerHTML = ""
			current.append(renderer.domElement)
			stage.animate()
		}
	}, [])
	return <div ref={divRef} className="canvasWrapper"></div>
}

export default LoopSubdivision
