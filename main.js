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
let scale = 10;         // position of the cubes
let mouse = {x:0,y:0};  // mouse pos
let animate = false

class Cube
{
    constructor(scale, rotate, color)
    {
        this.rotate = rotate
        this.scale = scale
        this.color = color
        this.points = 
        [
            [-this.scale,-this.scale,-this.scale],[-this.scale,-this.scale,this.scale],
            [this.scale,-this.scale,-this.scale],[-this.scale,this.scale,-this.scale],
            [-this.scale,this.scale,this.scale],[this.scale,-this.scale,this.scale],
            [this.scale,this.scale,-this.scale],[this.scale,this.scale,this.scale]
        ]
        this.vertices = 
        [
            [0,1],[0,2],[0,3],
            [2,5],[3,6],[3,4],
            [4,7],[6,7],[7,5],
            [5,1],[4,1],[2,6]
        ]
        //Angulos alpha, beta e gamma = an, bn, gn respectivamente
        this.an = 0
        this.bn = 0
        this.gn = 0

        // sin e cos separados para facilitar a semantica
        this.san = Math.sin(this.an)
        this.sbn = Math.sin(this.bn)
        this.sgn = Math.sin(this.gn)

        this.can = Math.cos(this.an)
        this.cbn = Math.cos(this.bn)
        this.cgn = Math.cos(this.gn)

        this.projectedY1 = ((this.y1*fov)/(this.z1+fov))*10     // projectedX = (x*fov)/z+fov
        this.projectedX2 = ((this.x2*fov)/(this.z2+fov))*10     // projectedY = (y*fov)/z+fov
        this.projectedY2 = ((this.y2*fov)/(this.z2+fov))*10     // projectedX = (x*fov)/z+fov
        this.projectedX1 = ((this.x1*fov)/(this.z1+fov))*10     // projectedY = (y*fov)/z+fov
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
            this.an+=0.01
            this.bn+=0.01
            this.gn+=0.01

            this.san = Math.sin(this.an)
            this.sbn = Math.sin(this.bn)
            this.sgn = Math.sin(this.gn)

            this.can = Math.cos(this.an)
            this.cbn = Math.cos(this.bn)
            this.cgn = Math.cos(this.gn)

        }
    }
}

let cube=[];
let numCubes = 1

for(let i = 0; i < numCubes; i++)
{
    cube[i] = new Cube(10,false,"#fff")
    cube[i].change()
}

document.addEventListener("keypress", e=>
{
    if(e.key == 'Enter'){
        animate == false ? animate = true : animate = false;
        const interval = setInterval(()=>{
            if(animate == true)
                {
                ctx.fillStyle = "#000"
                ctx.fillRect(-width,-height,width*2,height*2) 
                for(let i = 0; i < numCubes; i++)
                    {
                        cube[i].rotate = true
                        cube[i].change()
                    }
            }else
            {
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
        for(let i = 0; i < numCubes; i++)
        {
            cube[i].rotate = false
            cube[i].an += 0.1
            cube[i].san = Math.sin(cube[i].an)
            cube[i].can = Math.cos(cube[i].an)
            cube[i].change()
        }
        break;
    case '2':
        for(let i = 0; i < numCubes; i++)
        {
            cube[i].rotate = false
            cube[i].bn += 0.1
            cube[i].sbn = Math.sin(cube[i].bn)
            cube[i].cbn = Math.cos(cube[i].bn)
            cube[i].change()
        }
        break;
    case '3':
        for(let i = 0; i < numCubes; i++)
        {
            cube[i].rotate = false
            cube[i].gn += 0.1
            cube[i].sgn = Math.sin(cube[i].gn)
            cube[i].cgn = Math.cos(cube[i].gn)
            cube[i].change()
        }
        break;
    }
})

quadro.addEventListener("mousemove", e=>
{
    ctx.fillStyle = "#000"
    ctx.fillRect(-width,-height,width*2,height*2)
    for(let i = 0; i < numCubes; i++)
    {
        mouse = {x:(e.x - width/2)/10,y:(e.y - height/2)/10};
        cube[i].rotate = false
        cube[i].points = 
        [
            [-cube[i].scale+mouse.x,-cube[i].scale+mouse.y,-cube[i].scale],[-cube[i].scale+mouse.x,-cube[i].scale+mouse.y,cube[i].scale],
            [cube[i].scale+mouse.x,-cube[i].scale+mouse.y,-cube[i].scale],[-cube[i].scale+mouse.x,cube[i].scale+mouse.y,-cube[i].scale],
            [-cube[i].scale+mouse.x,cube[i].scale+mouse.y,cube[i].scale],[cube[i].scale+mouse.x,-cube[i].scale+mouse.y,cube[i].scale],
            [cube[i].scale+mouse.x,cube[i].scale+mouse.y,-cube[i].scale],[cube[i].scale+mouse.x,cube[i].scale+mouse.y,cube[i].scale]
        ]
        cube[i].change()
    }
})