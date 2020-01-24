class Menu
{
    constructor()
    {
        this.menuswitch;
        sessionStorage.setItem('_difficulty',1);
        this.buttons=[
            "Start.png",
            "Difficulty.png",
            "Exit.png",
        ].map(fileName => {
            var button = new MenuButton('../assets/'+fileName);
            return button;
        });

        this.menu = document.querySelector('div');
        
        this.buttons[0].addEventListener("click",()=>{
            window.location.replace('../game/index.html');
        });

        this.buttons[2].addEventListener("click",()=>{
            if(isFirefox)
            {
                let answer=window.confirm("Your browser is Firefox. Firefox disallows its users from closing applications in certain circumstances. For details, refer to the page?");
                if(answer)
                {
                    window.open("https://developer.mozilla.org/en-US/docs/Web/API/Window/close");
                }                
                return;
            }
            window.close();
        });

        this.buttons[1].addEventListener("mouseover",()=>{
            this.addSwitch();
        });
        this.buttons[1].addEventListener("mouseout",()=>{
            this.removeSwitch();
        });
        this.buttons[1].addEventListener("wheel",e =>{
            var tmpDiff=Number(sessionStorage.getItem('_difficulty'));
            if(e.deltaY < 0)//wheel up
            {
                e.preventDefault();
                sessionStorage.setItem('_difficulty', (tmpDiff===5?1: tmpDiff+1));
            }
                          
            else if(e.deltaY > 0)//wheel down
            {
                e.preventDefault();
                sessionStorage.setItem('_difficulty', (tmpDiff===1?5: tmpDiff-1));
            }

            this.removeSwitch();
            this.addSwitch();
            
        });

        this.buttons.forEach(button => {
            
            this.menu.appendChild(button);
        });
        
    }
    setDifficulty()
    {
        
        var tmpDiff=Number(sessionStorage.getItem('_difficulty'));
        
        switch(tmpDiff)
        {
            case 1: return "Baby";
            case 2: return "Easy";
            case 3: return "Medium";
            case 4: return "Hard";
            case 5: return "Crazy";
            default: return undefined;

        }
    }
    addSwitch()
    {
        let difficulty=this.setDifficulty();
        
        try {
            if(difficulty!=undefined)
            {
                this.menuswitch=new MenuSwitch("../assets/"+difficulty+".png");
                this.menu.appendChild(this.menuswitch);
            }
                
            else
                throw "undefined difficulty";
        } catch (error) {
            console.log(error);
        }
    }
    removeSwitch()
    {
        this.menu.removeChild(this.menuswitch);
    }
    
};

class MenuSwitch
{
    constructor(src)
    {
        this.cnvs=document.createElement('canvas');
        this.cnvs.width = 400;
        this.cnvs.height = 115;
        this.ctx=this.cnvs.getContext('2d');

        var image=new Image();
        image.src=src;
        
        image.onload = () => {
            this.ctx.drawImage(image,5,5);
        }

        return this.cnvs;
    }


}

class MenuButton extends MenuSwitch
{
    constructor(src)
    {
        var tmp=super(src);

        this.cnvs=tmp;
        this.cnvs.height = 80;
        this.cnvs.addEventListener('mouseover',()=>{
            this.cnvs.style.borderColor='#4DC53A';
        });
        this.cnvs.addEventListener('mouseout',()=>{
            this.cnvs.style.borderColor=document.body.style.backgroundColor;
        });
        return this.cnvs;
    }
}

var menu = new Menu;






