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

let fov = 50;       //camera distance from "screen"
let scale = 10;     //position of the cubes

//Angulos alpha, beta e gamma = an, bn, gn respectivamente
let an = 0
let bn = 0
let gn = 0

// sin e cos separados para facilitar a semantica
let san;
let sbn;
let sgn;

let can;
let cbn;
let cgn;

let points = 
[
    [-scale,-scale,-scale],[-scale,-scale,scale],
    [scale,-scale,-scale],[-scale,scale,-scale],
    [-scale,scale,scale],[scale,-scale,scale],
    [scale,scale,-scale],[scale,scale,scale]
]

let vertices = 
[
    [0,1],[0,2],[0,3],
    [2,5],[3,6],[3,4],
    [4,7],[6,7],[7,5],
    [5,1],[4,1],[2,6]
]

function DrawLine(x1,y1,x2,y2,lineColor)
{
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1,y1)
    ctx.lineTo(x2,y2)
    ctx.stroke()
}

function rotateZYX(ax,ay,az,bx,by,bz)
{
    // rotation on zyx axis
    let x1 = (cbn * cgn * ax) - (sgn * can * ay) + (cgn * san * sbn * ay) + (san * sgn * az) + (cgn * can * sbn * az);
    let y1 = (cbn * sgn * ax) + (cgn * can * ay) + (san * sgn * sbn * ay) - (cgn * san * az) + (sgn * can * sbn * az);
    let z1 = -(sbn * ax) + (cbn * san * ay) + (cbn * can * az);

    let x2 = (cbn * cgn * bx) - (sgn * can * by) + (cgn * san * sbn * by) + (san * sgn * bz) + (cgn * can * sbn * bz);
    let y2 = (cbn * sgn * bx) + (cgn * can * by) + (san * sgn * sbn * by) - (cgn * san * bz) + (sgn * can * sbn * bz);
    let z2 = -(sbn * bx) + (cbn * san * by) + (cbn * can * bz);

    return [[x1,y1,z1],[x2,y2,z2]]
}

let mouse = {x:0,y:0};

function Change(rotate)
{
    ctx.fillStyle = "#000"
    ctx.fillRect(-width,-height,width*2,height*2) 

    san = Math.sin(an)
    sbn = Math.sin(bn)
    sgn = Math.sin(gn)
    can = Math.cos(an)
    cbn = Math.cos(bn)
    cgn = Math.cos(gn)

    for(let x = 0; x < 12; x++)
    {
        let a = vertices[x][0];
        let b = vertices[x][1];

        let helper = rotateZYX(points[a][0],points[a][1],points[a][2],points[b][0],points[b][1],points[b][2])

        let x1 = helper[0][0]
        let y1 = helper[0][1]
        let z1 = helper[0][2]

        let x2 = helper[1][0]
        let y2 = helper[1][1]
        let z2 = helper[1][2]

        let projectedX1 = ((x1*fov)/(z1+fov))*10;     // projectedX = (x*fov)/z+fov;
        let projectedY1 = ((y1*fov)/(z1+fov))*10;     // projectedY = (y*fov)/z+fov;

        let projectedX2 = ((x2*fov)/(z2+fov))*10;     // projectedX = (x*fov)/z+fov;
        let projectedY2 = ((y2*fov)/(z2+fov))*10;     // projectedY = (y*fov)/z+fov;
    
        DrawLine(projectedX1,projectedY1,projectedX2, projectedY2,"#fff")

    }
    if(rotate == true)
    {
        an+=0.01
        bn+=0.01
        gn+=0.01

    }
}

Change(false)

document.addEventListener("keypress", e=>
{
    if(e.key == 'Enter'){
        setInterval(()=>{
            Change(true)
        },10)
    }
})

quadro.addEventListener("mousemove", e=>
{
    mouse = {x:(e.x - width/2)/10,y:(e.y - height/2)/10};
    points = 
    [
        [-scale+mouse.x,-scale+mouse.y,-scale],[-scale+mouse.x,-scale+mouse.y,scale],
        [scale+mouse.x,-scale+mouse.y,-scale],[-scale+mouse.x,scale+mouse.y,-scale],
        [-scale+mouse.x,scale+mouse.y,scale],[scale+mouse.x,-scale+mouse.y,scale],
        [scale+mouse.x,scale+mouse.y,-scale],[scale+mouse.x,scale+mouse.y,scale]
    ]
    Change(false)
})