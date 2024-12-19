/** @type {HTMLCanvasElement} */

const quadro = document.querySelector("#quadro")
const ctx = quadro.getContext("2d")

quadro.width = quadro.clientWidth
quadro.height = quadro.clientHeight

let width = quadro.width
let height = quadro.height

ctx.fillStyle = "#000"
ctx.fillRect(0,0,width,height)
ctx.translate(width/2,height/2)

let fov = 50;           // camera distance from "screen"
let scale = 10;         // size of mesh
let mouse = {x:0,y:0};  // mouse pos
let animate = false

class Mesh
{
    constructor(scale, points, vertices, rotate, color)
    {
        this.scale = scale
        this.points = points

        for(let i = 0; i < this.points.length; i++)
        {
        for(let index = 0; index < this.points[i].length; index++)
            {
                this.points[i][index] *= this.scale
            }
        }
        
        this.vertices = vertices
        this.rotate = rotate
        this.color = color

        //Angulos alpha, beta e gamma = an, bn, gn respectivamente
        this.an = 0
        this.bn = 0
        this.gn = 0

        // sin e cos separados para facilitar a semantica do rotate
        this.san = Math.sin(this.an)
        this.sbn = Math.sin(this.bn)
        this.sgn = Math.sin(this.gn)

        this.can = Math.cos(this.an)
        this.cbn = Math.cos(this.bn)
        this.cgn = Math.cos(this.gn)

        this.projectedX1 = ((this.x1*fov)/(this.z1+fov))*10     // projectedX = (x*fov)/z+fov
        this.projectedY1 = ((this.y1*fov)/(this.z1+fov))*10     // projectedY = (y*fov)/z+fov
        this.projectedX2 = ((this.x2*fov)/(this.z2+fov))*10     // projectedX = (x*fov)/z+fov
        this.projectedY2 = ((this.y2*fov)/(this.z2+fov))*10     // projectedY = (y*fov)/z+fov
    }

    drawLine(x1,y1,x2,y2,lineColor)
    {
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
        ctx.stroke()
    }

    rotateZYX(ax,ay,az,bx,by,bz)
    {
        // rotation on zyx axis
        this.x1 = (this.cbn * this.cgn * ax) - (this.sgn * this.can * ay) + (this.cgn * this.san * this.sbn * ay) + (this.san * this.sgn * az) + (this.cgn * this.can * this.sbn * az);
        this.y1 = (this.cbn * this.sgn * ax) + (this.cgn * this.can * ay) + (this.san * this.sgn * this.sbn * ay) - (this.cgn * this.san * az) + (this.sgn * this.can * this.sbn * az);
        this.z1 = -(this.sbn * ax) + (this.cbn * this.san * ay) + (this.cbn * this.can * az);

        this.x2 = (this.cbn * this.cgn * bx) - (this.sgn * this.can * by) + (this.cgn * this.san * this.sbn * by) + (this.san * this.sgn * bz) + (this.cgn * this.can * this.sbn * bz);
        this.y2 = (this.cbn * this.sgn * bx) + (this.cgn * this.can * by) + (this.san * this.sgn * this.sbn * by) - (this.cgn * this.san * bz) + (this.sgn * this.can * this.sbn * bz);
        this.z2 = -(this.sbn * bx) + (this.cbn * this.san * by) + (this.cbn * this.can * bz);
    }

    rotateX()
    {
        this.an+=0.01
        this.san = Math.sin(this.an)
        this.can = Math.cos(this.an)
    }

    rotateY()
    {
        this.bn+=0.01
        this.sbn = Math.sin(this.bn)
        this.cbn = Math.cos(this.bn)
    }

    rotateZ()
    {
        this.gn+=0.01
        this.sgn = Math.sin(this.gn)
        this.cgn = Math.cos(this.gn)
    }

    change()
    {
        for(let x = 0; x < this.vertices.length; x++)
        {

            this.rotateZYX(this.points[this.vertices[x][0]][0],this.points[this.vertices[x][0]][1],this.points[this.vertices[x][0]][2],this.points[this.vertices[x][1]][0],this.points[this.vertices[x][1]][1],this.points[this.vertices[x][1]][2])

            this.projectedX1 = ((this.x1*fov)/(this.z1+fov))*10;
            this.projectedY1 = ((this.y1*fov)/(this.z1+fov))*10;

            this.projectedX2 = ((this.x2*fov)/(this.z2+fov))*10;
            this.projectedY2 = ((this.y2*fov)/(this.z2+fov))*10;
        
            this.drawLine(this.projectedX1,this.projectedY1,this.projectedX2, this.projectedY2,this.color)

        }
        if(this.rotate == true)
        {
            this.rotateX()
            this.rotateY()
            this.rotateZ()
        }
    }
}

let cubePoints = 
[
    [-1,-1,-1], [-1,-1,1],
    [1,-1,-1],  [-1,1,-1],
    [-1,1,1],   [1,-1,1],
    [1,1,-1],   [1,1,1]
]

let cubeVertices = 
[
    [0,1],[0,2],[0,3],
    [2,5],[3,6],[3,4],
    [4,7],[6,7],[7,5],
    [5,1],[4,1],[2,6]
]

let piramidPoints = 
[
    [-1,1,1],   [-1,1,-1],
    [1,1,-1],   [1,1,1],
    [0,-1,0]
]

let piramidVertices = 
[
    [0,1],[0,3],[0,4],
    [1,2],[1,4],[2,3],
    [2,4],[3,4]
]

let collapsedCubePoints = 
[
    [-1,-1,-1], [-1,-1,1],
    [1,-1,-1],  [-1,1,-1],
    [-1,1,1],   [1,-1,1],
    [1,1,-1],   [1,1,1],
    [0,0,0]
]

let collapsedCubeVertices = 
[
    [0,8],[1,8],[2,8],
    [3,8],[4,8],[5,8],
    [6,8],[7,8]
]

let trianglePoints = 
[
    [-1,1,-1],   [1,1,-1],
    [0,-1,0]
]

let triangleVertices = 
[
    [0,1],[0,2],
    [1,2]
]

let cube = new Mesh(scale,cubePoints,cubeVertices,false,"#fff")
cube.change()

let piramid = new Mesh(scale,piramidPoints,piramidVertices,false,"#fff")
piramid.change()

let collapsedCube = new Mesh(scale,collapsedCubePoints,collapsedCubeVertices,false,"#fff")
collapsedCube.change()


document.addEventListener("keypress", e=>
{
    if(e.key == 'Enter'){
        animate == false ? animate = true : animate = false;
        const interval = setInterval(()=>{
            ctx.fillStyle = "#000"
            ctx.fillRect(-width,-height,width*2,height*2)
            if(animate == true)
            { 
                cube.rotate = true
                cube.change()

                piramid.rotate = true
                piramid.change()
                
                collapsedCube.rotate = true
                collapsedCube.change()
            }else
            {
                cube.rotate = false
                cube.change()

                piramid.rotate = false
                piramid.change()
                
                collapsedCube.rotate = false
                collapsedCube.change()
                clearInterval(interval)
            }
        },10)
    }
})

document.addEventListener("keypress", e=>
{
    ctx.fillStyle = "#000"
    ctx.fillRect(-width,-height,width*2,height*2) 
    switch (e.key) {
    case '1':
        cube.rotate = false
        cube.rotateX()
        cube.change()

        piramid.rotate = false
        piramid.rotateX()
        piramid.change()

        collapsedCube.rotate = false
        collapsedCube.rotateX()
        collapsedCube.change()
        break;
    case '2':
        
        cube.rotate = false
        cube.rotateY()
        cube.change()

        piramid.rotate = false
        piramid.rotateY()
        piramid.change()

        collapsedCube.rotate = false
        collapsedCube.rotateY()
        collapsedCube.change()
        break;
    case '3':
        cube.rotate = false
        cube.rotateZ()
        cube.change()

        piramid.rotate = false
        piramid.rotateZ()
        piramid.change()

        collapsedCube.rotate = false
        collapsedCube.rotateZ()
        collapsedCube.change()
        break;
    }
})