/** @type {HTMLCanvasElement} */

const quadro = document.querySelector("#quadro")
const ctx = quadro.getContext("2d")

quadro.width = quadro.clientWidth
quadro.height = quadro.clientHeight

let width = quadro.width
let height = quadro.height

//background color black
ctx.fillStyle = "#000"
ctx.fillRect(0,0,width,height)
ctx.translate(width/2,height/2)

let fov = 50;               // camera distance from "screen"
let scale = 10;             // size of mesh
let mouse = {x:0,y:0};      // mouse pos
let animate = false;

class Mesh
{
    constructor(scale, points, vertices, rotate, color)
    {
        this.scale = scale;
        this.points = points;

        for(let i = 0; i < this.points.length; i++)
            for(let index = 0; index < this.points[i].length; index++)
                this.points[i][index] *= this.scale;

        this.vertices = vertices;
        this.rotate = rotate;
        this.color = color;

        //alpha, beta and gamma angles = an, bn, gn respectively
        this.an = 0;
        this.bn = 0;
        this.gn = 0;

        // sin and cos angles
        this.san = Math.sin(this.an);
        this.sbn = Math.sin(this.bn);
        this.sgn = Math.sin(this.gn);

        this.can = Math.cos(this.an);
        this.cbn = Math.cos(this.bn);
        this.cgn = Math.cos(this.gn);

        // projectedX = (x*fov)/z+fov
        // projectedY = (y*fov)/z+fov
        this.projectedX1;
        this.projectedY1;
        this.projectedX2;
        this.projectedY2;
        this.projectedX3;
        this.projectedY3;
    }

    Calculate()
    {
        this.projectedX1 = ((this.x1*fov)/(this.z1+fov))*this.scale;
        this.projectedY1 = ((this.y1*fov)/(this.z1+fov))*this.scale;

        this.projectedX2 = ((this.x2*fov)/(this.z2+fov))*this.scale;
        this.projectedY2 = ((this.y2*fov)/(this.z2+fov))*this.scale;

        this.projectedX3 = ((this.x3*fov)/(this.z3+fov))*this.scale;
        this.projectedY3 = ((this.y3*fov)/(this.z3+fov))*this.scale;
    }

    DrawTriangle(x1,y1,x2,y2,x3,y3,lineColor)
    {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = .5;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineTo(x3,y3);
        ctx.lineTo(x1,y1);
        ctx.stroke();
    }
    DrawFace(x1,y1,x2,y2,x3,y3,color)
    {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineTo(x3,y3);
        ctx.closePath();
        ctx.fill();
    }

    RotateZYX(ax,ay,az,bx,by,bz,cx,cy,cz)
    {
        // rotation on zyx axis
        this.x1 = (this.cbn * this.cgn * ax) - (this.sgn * this.can * ay) + (this.cgn * this.san * this.sbn * ay) + (this.san * this.sgn * az) + (this.cgn * this.can * this.sbn * az);
        this.y1 = (this.cbn * this.sgn * ax) + (this.cgn * this.can * ay) + (this.san * this.sgn * this.sbn * ay) - (this.cgn * this.san * az) + (this.sgn * this.can * this.sbn * az);
        this.z1 = -(this.sbn * ax) + (this.cbn * this.san * ay) + (this.cbn * this.can * az);

        this.x2 = (this.cbn * this.cgn * bx) - (this.sgn * this.can * by) + (this.cgn * this.san * this.sbn * by) + (this.san * this.sgn * bz) + (this.cgn * this.can * this.sbn * bz);
        this.y2 = (this.cbn * this.sgn * bx) + (this.cgn * this.can * by) + (this.san * this.sgn * this.sbn * by) - (this.cgn * this.san * bz) + (this.sgn * this.can * this.sbn * bz);
        this.z2 = -(this.sbn * bx) + (this.cbn * this.san * by) + (this.cbn * this.can * bz);

        this.x3 = (this.cbn * this.cgn * cx) - (this.sgn * this.can * cy) + (this.cgn * this.san * this.sbn * cy) + (this.san * this.sgn * cz) + (this.cgn * this.can * this.sbn * cz);
        this.y3 = (this.cbn * this.sgn * cx) + (this.cgn * this.can * cy) + (this.san * this.sgn * this.sbn * cy) - (this.cgn * this.san * cz) + (this.sgn * this.can * this.sbn * cz);
        this.z3 = -(this.sbn * cx) + (this.cbn * this.san * cy) + (this.cbn * this.can * cz);
    }

    RotateXPos()
    {
        this.an+=0.01;
        this.san = Math.sin(this.an);
        this.can = Math.cos(this.an);
    }

    RotateXNeg()
    {
        this.an-=0.01;
        this.san = Math.sin(this.an);
        this.can = Math.cos(this.an);
    }

    RotateYPos()
    {
        this.bn+=0.01;
        this.sbn = Math.sin(this.bn);
        this.cbn = Math.cos(this.bn);
    }

    RotateYNeg()
    {
        this.bn-=0.01;
        this.sbn = Math.sin(this.bn);
        this.cbn = Math.cos(this.bn);
    }

    RotateZPos()
    {
        this.gn+=0.01;
        this.sgn = Math.sin(this.gn);
        this.cgn = Math.cos(this.gn);
    }

    RotateZNeg()
    {
        this.gn-=0.01;
        this.sgn = Math.sin(this.gn);
        this.cgn = Math.cos(this.gn);
    }

    Change()
    {
        for(let x = 0; x < this.vertices.length; x++)
        {

            this.RotateZYX(this.points[this.vertices[x][0]][0],
                           this.points[this.vertices[x][0]][1],
                           this.points[this.vertices[x][0]][2],
                           this.points[this.vertices[x][1]][0],
                           this.points[this.vertices[x][1]][1],
                           this.points[this.vertices[x][1]][2],
                           this.points[this.vertices[x][2]][0],
                           this.points[this.vertices[x][2]][1],
                           this.points[this.vertices[x][2]][2]);

            this.Calculate();

            this.DrawFace(this.projectedX1,
                          this.projectedY1,
                          this.projectedX2, 
                          this.projectedY2,
                          this.projectedX3,
                          this.projectedY3,
                          `hsla(275, 100.00%, 50.00%,0.10)`);

            this.DrawTriangle(this.projectedX1,
                          this.projectedY1,
                          this.projectedX2, 
                          this.projectedY2,
                          this.projectedX3,
                          this.projectedY3,
                          this.color);


        }
        if(this.rotate == true)
        {
            this.RotateXPos();
            this.RotateYPos();
            this.RotateZPos();
        }
    }
}

let cubePoints = 
[
    [-1,-1,1],  [1,-1,1],
    [-1,1,1],   [1,1,1],
    [-1,1,-1],  [1,1,-1],
    [1,-1,-1],  [-1,-1,-1]
]

let cubeVertices = 
[
    [0,1,2],[1,2,3],
    [4,5,6],[4,6,7],
    [1,3,5],[1,5,6],
    [2,4,7],[0,2,7],
    [0,1,7],[1,6,7],
    [2,4,5],[2,3,5]
]

let mesh = new Mesh(scale,cubePoints,cubeVertices,false,"#fff")
mesh.Change()

document.addEventListener("keypress", e=>
{
    if(e.key == 'Enter'){
        animate == false ? animate = true : animate = false;
        const interval = setInterval(()=>{
            ctx.fillStyle = "#000"
            ctx.fillRect(-width,-height,width*2,height*2)
            if(animate == true)
            { 
                mesh.rotate = true
            }else
            {
                mesh.rotate = false
                clearInterval(interval)
            }
            mesh.Change()
        },10)
    }
})

document.addEventListener("keypress", e=>
{
        ctx.fillStyle = "#000"
        ctx.fillRect(-width,-height,width*2,height*2)
        switch (e.key) 
        {
            case '1':
                mesh.RotateXPos()
                break;
            case '2':
                mesh.RotateYPos()
                break;
            case '3':
                mesh.RotateZPos()
                break;
            case '4':
                mesh.RotateXNeg()
                break;
            case '5':
                mesh.RotateYNeg()
                break;
            case '6':
                mesh.RotateZNeg()
                break;
            default:
                mesh.Change()
                break;
        }
        mesh.Change()
})