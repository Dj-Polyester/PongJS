let VEL_MAX=300;
let DAMP=.7

class Vector
{
    constructor(x=0,y=0)
    {
        this.x=x;
        this.y=y;
    }

    get len()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    set len(value)
    {
        const fact = value / this.len;
        this.x*=fact;
        this.y*=fact;
    }
}

class Canvas
{
    constructor(w,h)
    {
        self=document.createElement("canvas");
        
        document.body.appendChild(self);
        self.width = w;
        self.height = h;
        return self;
    }
}

class Rect
{
    constructor(x,y,w,h,v1=0,v2=0)
    {
        this.size = new Vector(w,h);
        
        this.pos = new Vector(x,y);
        this.oldpos = new Vector(x,y);
        
        this.vel = new Vector(v1,v2);
        this.oldvel = new Vector(0,0);
    }
    get left(){return this.pos.x-this.size.x/2;}
    get right(){return this.pos.x+this.size.x/2;}
    get top(){return this.pos.y-this.size.y/2;}
    get bottom(){return this.pos.y+this.size.y/2;}
}
class Player extends Rect
{
    constructor(x,y,canvas)
    {
        super(x,y,canvas.height*.05,canvas.height*.25);
        this.score=0;
    }
}
class Ball extends Rect
{
    constructor(canvas)
    {
        super(canvas.width*.5,canvas.height*.5,canvas.height*.025,canvas.height*.025);
    }
}
class Pong
{
    constructor(canvas)
    {
        this.DIFFICULTY=Number(sessionStorage.getItem('_difficulty'));
        this.colliding={
            x:false,
            y:false,
        };
        //canvas, context
        this._canvas=canvas;
        this._context=canvas.getContext("2d");
        //ball, player
        this.ball=new Ball(this._canvas);
        this.players = [
            new Player(/*pos*/ 40,canvas.height/2, this._canvas),
            new Player(/*pos*/ canvas.width-40,canvas.height/2, this._canvas),
        ];
        
        //animation
        var lasttime = null;
        this.callback = (ms) => {
            
            if(lasttime) this.update((ms-lasttime)/1000);
            lasttime = ms;
            
            requestAnimationFrame(this.callback);
        };
        
        this.CHAR_PIXEL=10;

        this.CHARS = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        
    }
    drawScore()
    {
        const align = this._canvas.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char | 0], offset + pos * cw, 20);
            });
        });
    }
    update(dt)
    {
        this.ball.pos.x+=this.ball.vel.x * dt;
        this.ball.pos.y+=this.ball.vel.y * dt;

        this.players[1].vel.y=this.ball.vel.y*.1*(4+this.DIFFICULTY+Math.random());
        this.players[1].pos.y+=this.players[1].vel.y * dt;

        let playerId;
        //BOUNCING
        if(this.ball.left<0 || this.ball.right>this._canvas.width)
        {
            playerId=+(this.ball.vel.x<0);
            this.ball.vel.x=-this.ball.vel.x;
            
            ++this.players[playerId].score;
            this.reset();
        }
        if(this.ball.top<0 || this.ball.bottom>this._canvas.height)
        {
            this.ball.vel.y=-this.ball.vel.y;
        }

        //COLLISION
        this.players.forEach(player => {
            this.collideH(player,this.ball);
            this.collideV(player,this.ball);
        });

        this.draw();
    }

    reset()
    {
        this.ball.pos.x=this._canvas.width/2;
        this.ball.pos.y=this._canvas.height/2;

        this.ball.vel.x=0;
        this.ball.vel.y=0;

        this.players[1].pos.y=this.ball.pos.y;
        this.drawScore();
    }
    //horizontal collision
    collideH(player,ball)
    {
        //collides on the right
        if( 
            ( player.right > ball.left && player.right < ball.right &&
            ((ball.bottom > player.top && ball.bottom < player.bottom) || 
             (ball.top < player.bottom && ball.top > player.top)) )
             
             //collides on the left
             ||
             
             (player.left < ball.right && player.left > ball.left &&
            ((ball.bottom > player.top && ball.bottom < player.bottom) || 
             (ball.top < player.bottom && ball.top > player.top)) ) 
             
             )
        {
            
            if(this.colliding.x===false)
            {
                ball.oldvel.x=ball.vel.x;
                ball.vel.x=(ball.oldvel.x<VEL_MAX)*DAMP*(player.vel.x)-ball.oldvel.x;
                this.colliding.x=true;
            }
        }
        this.colliding.x=false;
    }
    //vertical collision
    collideV(player,ball)
    {
        //collides on the top
        if(player.top < ball.bottom && player.top > ball.top &&
            ((ball.left > player.left && ball.left < player.right) || 
             (ball.right < player.right && ball.right > player.left)) 
             //collides on the bottom
             ||
             player.bottom < ball.bottom && player.bottom > ball.top &&
            ((ball.left > player.left && ball.left < player.right) || 
             (ball.right < player.right && ball.right > player.left)) )
        {
            
            if(this.colliding.y===false)
            {
                ball.oldvel.y=ball.vel.y;
                ball.vel.y=(ball.oldvel.y<VEL_MAX)*DAMP*(player.vel.y)-ball.oldvel.y;
                this.colliding.y=true;
            } 
            
        }
        this.colliding.y=false;
    }
    // collide(player, ball)
    // {
    //     if (player.left < ball.right && player.right > ball.left &&
    //         player.top < ball.bottom && player.bottom > ball.top)
    //     {
    //         if(this.colliding==false)
    //         { 
    //             ball.oldvel.y=ball.vel.y;
    //             ball.vel.y=(ball.oldvel.y<VEL_MAX)*DAMP*(player.vel.y)-ball.oldvel.y;
                
    //             ball.oldvel.x=ball.vel.x;
    //             ball.vel.x=(ball.oldvel.x<VEL_MAX)*DAMP*(player.vel.x)-ball.oldvel.x;
    //             this.colliding=true;
    //         } 
    //     }
    //     this.colliding=false;
    // }
    play()
    {
        if(this.ball.vel.x === 0 && this.ball.vel.y === 0)
        {
            
            this.ball.vel.y=( (2* (Math.random()<0.5) )|0 -1)*Math.random();
            this.ball.vel.x=this.DIFFICULTY*this.ball.vel.y+( (2* (this.ball.vel.y>0) |0) -1)*Math.random();
            this.ball.vel.len=150*this.DIFFICULTY;

            //console.log(this.ball.vel.y ,this.ball.vel.x);
            
        }
    }
    start()
    {
        requestAnimationFrame(this.callback);
    }
    drawRect(rect)
    {
        this._context.fillStyle = "#fff";
        this._context.fillRect(rect.left,rect.top,rect.size.x,rect.size.y);
    }
    draw()
    {
        // this._canvas.width=document.body.width;
        // this._canvas.height=this._canvas.height*1.6;
        
        this._context.fillStyle = "#000";
        this._context.fillRect(0,0,this._canvas.width,this._canvas.height);
        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }
    
}

//prepare canvas
const canvas = new Canvas(800,500);
//set the game
const backButton=document.querySelector('p');
const pong = new Pong(canvas);
//start the game
pong.start();

backButton.addEventListener("click", () =>{
    window.location.replace('../menu/index.html');
});

canvas.addEventListener("mousemove", e =>
{
    const dt=0.15;
    //const scaleX = e.offsetX / e.target.getBoundingClientRect().width;
    //const scaleY = e.offsetY / e.target.getBoundingClientRect().height;
    //get positions by cursor update the mouse x, y
    if(e.offsetX < canvas.width/4 && e.offsetX > 40) 
        
        pong.players[0].pos.x = e.offsetX;
    if(e.offsetY < pong._canvas.height-50 && e.offsetY > 50)
        pong.players[0].pos.y = e.offsetY;
    //velocities updated
    pong.players[0].vel.x = (pong.players[0].pos.x-pong.players[0].oldpos.x)/dt;
    pong.players[0].vel.y = (pong.players[0].pos.y-pong.players[0].oldpos.y)/dt;
    
    pong.collideH(pong.players[0],pong.ball);
    pong.collideV(pong.players[0],pong.ball);

    pong.players[0].oldpos.x = pong.players[0].pos.x;
    pong.players[0].oldpos.y = pong.players[0].pos.y;

    pong.players[0].oldvel.x = pong.players[0].vel.x;
    pong.players[0].oldvel.y = pong.players[0].vel.y;

});

//start on click
canvas.addEventListener("click",e =>
{
    pong.play();
});



