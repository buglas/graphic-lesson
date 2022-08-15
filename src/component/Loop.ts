import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute, Vector3 } from "three";

//几何体的顶点索引
let index:ArrayLike<number>
//几何体的顶点数据
let originPositionAttr: BufferAttribute | InterleavedBufferAttribute

/* 
Loop对象
originGeometry 初始几何体，要基于此模型增加面数，需要有顶点索引
geometry 细分后的几何体
level 细分级数，默认为1，level越高，分得越细
*/
export default class Loop{
  originGeometry: BufferGeometry=new BufferGeometry();
  level: number;
  geometry: BufferGeometry=new BufferGeometry();
  constructor(originGeometry:BufferGeometry,level:number=1){
    this.originGeometry=originGeometry
    this.geometry=originGeometry
    this.level=level
    this.update()
  }
  // 更新geometry
  update(){
    const {level}=this
    for(let i=0;i<level;i++){
      const {geometry}=this
      const indexAttr=geometry.getIndex()
      if(!indexAttr){return}
      index=indexAttr.array
      originPositionAttr=geometry.getAttribute('position')
      const geo=subdivide()
      if(geo){
        geo.computeVertexNormals()
        this.geometry=geo
      }
    }
  }
}

/* 细分几何体 */
interface GeoData{
  // 顶点数据
  position:Array<number>
  // 顶点索引
  index?:Array<number>
  // uv坐标，尚未计算
  uv?:Array<number>
}
function subdivide():BufferGeometry|null{
  // 计算新的三角形顶点
  const newGeoData:GeoData=crtNewPoints()

  // 更新旧的三角形顶点
  const oldGeoData:GeoData=updateOldPoints()

  // 将新老顶点合成新的几何体
  return compose(newGeoData,oldGeoData)
}

/* 计算新的三角形顶点 */
function crtNewPoints():GeoData{
  // 新的顶点集合
  const newPos:Array<number>=[]
  // 新的三角形集合
  const newTirangles:Array<Array<number>>=[]
  forTriangle(()=>{newTirangles.push([])})

  // 新点索引
  let newInd=originPositionAttr.count-1

  // 遍历顶点
  forPoint(({i0,i1,i2,triangleInd,pointInd})=>{
    // 判断当前顶点是否在newTirangles中
    if(newTirangles[triangleInd][pointInd]){return}
    newInd++

    // 获取当前顶点与下一个顶点所连成的边的对点
    const counterPoint:Array<number>|null=getCounterPoint(i1,i0)
    const p0=getPointByInd(i0,originPositionAttr)
    const p1=getPointByInd(i1,originPositionAttr)

    // 新点
    let p:Vector3
    
    if(counterPoint){
      // 当新顶点为几何体内公共边上的顶点时，计算此点位
      const p2=getPointByInd(i2,originPositionAttr)
      const p3=getPointByInd(counterPoint[2],originPositionAttr)
      p=computeNewPoint(p2,p0,p1,p3)
      // 存储顶点，避免重复计算
      newTirangles[counterPoint[0]][counterPoint[1]]=newInd
    }else{
      // 当新顶点为几何体边界上的顶点时，以中心点为新点位
      p=computeCenterPoint(p0,p1)
    }
    newPos.push(p.x,p.y,p.z)
    newTirangles[triangleInd][pointInd]=newInd
  })

  return {
    position:newPos,
    index:newTirangles.flat()
  }
}

/* 更新旧的三角形顶点 */
function updateOldPoints():GeoData{
  // 遍历旧顶点集合
  const oldPoints=[]
  // 遍历老顶点
  for(let i=0;i<originPositionAttr.count;i++){
    // 更新老顶点
    const oldPoint=computeOldPoint(
      // 当前点
      getPointByInd(i),
      // 根据当前点的顶点索引获取与此点相邻的顶点
      getNearPoints(i)
    )
    oldPoints.push(oldPoint.x,oldPoint.y,oldPoint.z)
  }
  return {
    position:oldPoints
  }
}

/* 将新老顶点合成新的几何体 */
function compose(newGeoData:GeoData,oldGeoData:GeoData):BufferGeometry|null{
  const geo=new BufferGeometry()
  geo.setAttribute(
    'position',
    new BufferAttribute(
      new Float32Array([
        ...oldGeoData.position,
        ...newGeoData.position,
      ]),
      3
    )
  )
  const curIndex:Array<number>=[]
  const newIndex=newGeoData.index
  if(!newIndex){return null}
  let [p0,p1,p2,p3,p4,p5]=[0,0,0,0,0,0];
  // 遍历三角形
  forTriangle(({i,triangle})=>{
    [p0,p1,p2]=triangle
    p3=newIndex[i]
    p4=newIndex[i+1]
    p5=newIndex[i+2]
    curIndex.push(
      p0,p3,p5,
      p3,p1,p4,
      p3,p4,p5,
      p5,p4,p2
    )
  })
  geo.setIndex(curIndex)
  return geo
}

// 几何体内公共边上的顶点
function computeNewPoint(A:Vector3,B:Vector3,C:Vector3,D:Vector3):Vector3{
  return A.clone().add(D).multiplyScalar(1/8).add(
    B.clone().add(C).multiplyScalar(3/8)
  )
}

// 几何体边界上的顶点
function computeCenterPoint(A:Vector3,B:Vector3){
  return A.clone().lerp(B,0.5)
}

// 更新老点
function computeOldPoint(oldPoint:Vector3,nearPoints:Array<Vector3>){
  const n=nearPoints.length
  const u=getU(n)
  const old=oldPoint.clone()
  const sumP=sum(nearPoints)
  return old.multiplyScalar(1-n*u).add(sumP.multiplyScalar(u))
}

// 获取u
function getU(n:number){
  if(n===3){
    return 3/16
  }
  return 3/(8*n)
}
/* function getU(n:number){
  const a=3/8+Math.cos(Math.PI*2/n)/4
  return (5/8-a*a)/n
} */

// 多点之和
function sum(points:Array<Vector3>){
  const v=new Vector3()
  points.forEach(p=>{v.add(p)})
  return v
}

// 获取顶点的邻点
function getNearPoints(ind:number):Array<Vector3>{
  const nearPoints:Set<number>=new Set()
  forTriangle(({triangle})=>{
    const pointInd=triangle.indexOf(ind)
    if(pointInd!==-1){
      const arr=[...triangle]
      arr.splice(pointInd,1)
      nearPoints.add(arr[0])
      nearPoints.add(arr[1])
    }
  })
  return [...nearPoints].map(ind=>getPointByInd(ind))
}

// 根据索引值，获取点位
function getPointByInd(ind:number,attr=originPositionAttr){
  return new Vector3(
    attr.getX(ind),
    attr.getY(ind),
    attr.getZ(ind),
  )
}

// 获取一边的对点，及其位置
function getCounterPoint(i0:number,i1:number){
  let data:Array<number>|null=null
  // 遍历顶点
  forPoint(({
    i0:j0,
    i1:j1,
    i2:j2,
    triangleInd,
    pointInd
  })=>{
    if(i0===j0&&i1===j1){
      data=[triangleInd,pointInd,j2]
    }
  })
  return data
}

/* 根据顶点索引遍历三角形 */
interface TriangleData{
  // 三角形在顶点索引中的索引位
  i:number
  // 三角形
  triangle:Array<number>
}
function forTriangle(fn=(param:TriangleData)=>{}){
  for(let i=0,len=index.length;i<len;i+=3){
    fn({i,triangle:[index[i],index[i+1],index[i+2]]})
  }
}

/* 遍历顶点 */
interface PointData{
  // 从当前顶点索引至后的当前三角形的三个顶点索引
  i0:number
  i1:number
  i2:number
  // 当前顶点在平展开的顶点集合中的索引位置
  j:number
  // 三角形在以三角形为单位的顶点索引集合中的索引位
  triangleInd:number
  // 顶点在当前三角形中的索引位
  pointInd:number
}
function forPoint(fn=(param:PointData)=>{}){
  for(let i=0,len=index.length;i<len;i++){
    const a=i%3
    const b=i-a
    fn({
      i0:index[i],
      i1:index[b+(a+1)%3],
      i2:index[b+(a+2)%3],
      j:index[i]*3,
      triangleInd:b/3,
      pointInd:a
    })
  }
}