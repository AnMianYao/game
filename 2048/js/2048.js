var game2048={
    timer:null,
    mainDom:document.querySelector("#gamePanel"),
    cardsDom:document.querySelector("section#cards"),
    scoreDiv:document.querySelector("#score"),
    bestSpan:document.querySelector("#best"),
    coverDom:document.querySelector("#cover"),
    matrix:[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    score:0
};



 game2048.createCard=function (array) {
    var row=array[0];
    var col=array[1];
    var num=array[2];
    var div=document.createElement("div");
    div.classList.add("cardNum");
    div.classList.add("cardNum-"+num);
    div.style.left=col*80+"px";
    div.style.top=row*80+"px";
    var position=+row+"-"+col;
    div.setAttribute("data-position",position);
    div.innerHTML=num;
    this.cardsDom.appendChild(div);
};
 game2048.firstShow=function () {
    this.randomPosition();
    this.randomPosition();
};
 game2048.reStart=function () {
     this.matrix=[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
     this.score=0;
     var best=window.localStorage.getItem("best");
     this.bestSpan.innerHTML=best?best:"0";
     this.scoreDiv.innerHTML="0";
     this.cardsDom.innerHTML="";
     this.firstShow();
 };
 game2048.init=function () {
    this.reStart();
    this.handleTouchEvent();

};
 game2048.toast=function (message,interval) {
    var div=document.createElement("div");
    div.classList.add("toast");
    div.innerHTML=message;
    document.body.appendChild(div);

    setTimeout(function () {
        document.body.removeChild(div);
        div=null;
    },interval)


};
 game2048.handleTouchEvent=function () {
    var self=this;
    var startX;
    var startY;
    var endX;
    var endY;
    var dx;
    var dy;
    function touchStart(event) {
        if (event.touches.length===1){
            startX = event.touches[0].pageX;
            startY = event.touches[0].pageY;
        }

    }
    function touchMove(event) {

        if (event.touches.length===1){
            endX=event.changedTouches[0].pageX;
            endY=event.changedTouches[0].pageY;
        }
    }
    function touchEnd(event) {
        if (event.target.id==="cover"){
            return false;
        }
        if (event.touches.length===1){
            endX=event.changedTouches[0].pageX;
            endY=event.changedTouches[0].pageY;

        }
        dx=endX-startX;
        dy=endY-startY;

        if (!self.isOver()){
            if (dy<0 &&Math.abs(dy)>Math.abs(dx)){
                console.log("up");
                self.move().up();
                self.randomPosition();
            }else  if (dy>0 &&Math.abs(dy)>Math.abs(dx)){
                console.log("down");
                self.move().down();
                self.randomPosition();
            }else  if (dx<0 &&Math.abs(dx)>Math.abs(dy)){
                console.log("left");
                self.move().left();
                self.randomPosition();
            }else if (dx>0 &&Math.abs(dx)>Math.abs(dy)){
                console.log("right");
                self.move().right();
                self.randomPosition();
            }

        }
        startX=startY=endX=endY=dx=dy=null;


    }



    this.mainDom.addEventListener("touchstart",touchStart,false);
    this.mainDom.addEventListener("touchmove",touchMove,false);
    this.mainDom.addEventListener("touchend",touchEnd,false);

};
 game2048.randomPosition=function () {
    var row=Math.floor(Math.random()*4);
    var col=Math.floor(Math.random()*4);
    var num=Math.random()>0.5?2:4;
    var self=this;

    if (this.matrix[row][col]===0){
        this.matrix[row][col]=num;
        var array= [row,col,num];

        setTimeout(function () {
            self.createCard(array);
        },500);
        return true;
    }

    this.randomPosition();
};
 game2048.isOver=function () {

    if (this.score>=2048){
        this.gameOver("Winner!");
        this.toast('you win the game!', 4000);
        return true;
    }
    for (var i=0;i<4;i++){
        for (var j=0;j<4;j++){
            if (this.matrix[i][j]===0){
                return false;
            }
        }
    }
    this.gameOver("Game Over!");
    this.toast('Game Over!', 4000);
    return true;
};
 game2048.gameOver=function (msg) {

    this.coverDom.innerHTML=msg;
    this.coverDom.classList.remove("hide");
    var best=window.localStorage.getItem("best");
    best=best>this.score?best:this.score;
    window.localStorage.setItem("best",best);
};
 game2048.move=function () {
    var self=this;
    var getPoition=function (node) {
        var position=node.getAttribute('data-position');
        var positionArrary=position.split("-");
        node=null;
        return [positionArrary[0],positionArrary[1]]
    };

    var collectionCards=function (option) {

        var cards=self.cardsDom.children;
        cards=Array.prototype.slice.call(cards);

        var cardObject={};
        var sortCondition;

        switch (option){
            case "row":
                sortCondition="col";
                cards.forEach(function (t) {
                    var position=getPoition(t);
                    var row=position[0];
                    var col=position[1];
                    if (cardObject[row]===undefined){
                        cardObject[row]=[];
                    }
                    cardObject[row].push({
                        col:col,
                        element:t,
                        num:t.innerHTML
                    });

                });
                break;
            case "col":
                sortCondition="row";
                cards.forEach(function (t) {
                    var position=getPoition(t);
                    var row=position[0];
                    var col=position[1];

                    if (cardObject[col]===undefined){
                        cardObject[col]=[];
                    }
                    cardObject[col].push({
                        row:row,
                        element:t,
                        num:t.innerHTML
                    });
                });
                break;
            default:
                break;
        }
        var keys=Object.keys(cardObject);

        keys.forEach(function (t) {
            var items=cardObject[t];

            if (items.length>1){
                cardObject[t]=items.sort(function (p1,p2) {
                    return p1[sortCondition]>p2[sortCondition]?1:-1;
                });
            }
        });
        cards=null;
        return cardObject;
    };

    var left=function () {
        var cardObject=collectionCards("row");
        var rowsKeys=Object.keys(cardObject);

        rowsKeys.forEach(function (t) {
            var rows=cardObject[t];
            var row=parseInt(t);

            var mergeNumber=0;
            rows.forEach(function (value,index) {
                var card=value.element;
                var col=value.col;
                var change=index-mergeNumber;
                var num=parseInt(value.num);

                self.matrix[row][col]=0;
                self.matrix[row][change]=num;

                if (index>=1){
                    var isMerge=self.isMerge(card,row,change,"left");

                    if (!!isMerge){
                        mergeNumber++;
                        self.updateScore(num);
                        var callback=function () {
                            var left=rows[change-1].element;
                            self.mergeAnimate(left);
                            self.cardsDom.removeChild(card);
                            rows.slice(index,1);
                            left.innerHTML=2*num;
                            left.classList.remove('cardNum-'+num);
                            left.classList.add('cardNum-'+2*num);
                        }
                    }
                }
                self.moveAnimate(card,"left",change,row+"-"+change,callback);


            })





        });


    };
    var right=function () {
        var cardObject=collectionCards("row");
        var rowsKeys=Object.keys(cardObject);

        rowsKeys.forEach(function (t) {
            var rows=cardObject[t].reverse();
            var row=parseInt(t);
            var mergeNumber=0;
            rows.forEach(function (value,index) {
                var card=value.element;
                var col=value.col;
                var change=3-index+mergeNumber;
                var num=parseInt(value.num);

                self.matrix[row][col]=0;
                self.matrix[row][change]=num;

                if (index>=1){
                    var isMerge=self.isMerge(card,row,change,"right");

                    if (!!isMerge){
                        mergeNumber++;
                        self.updateScore(num);
                        var callback=function () {
                            var right=rows[index-1].element;
                            self.mergeAnimate(right);
                            self.cardsDom.removeChild(card);
                            rows.slice(index,1);
                            right.innerHTML=2*num;
                            right.classList.remove('cardNum-'+num);
                            right.classList.add('cardNum-'+2*num);

                        }
                    }
                }
                self.moveAnimate(card,"left",change,row+"-"+change,callback);


            })





        });


    };
    var up=function () {
        var cardObject=collectionCards("col");
        var rowsKeys=Object.keys(cardObject);

        rowsKeys.forEach(function (t) {
            var cols=cardObject[t];
            var col=parseInt(t);
            var mergeNumber=0;
            cols.forEach(function (value,index) {
                var card=value.element;
                var row=value.row;
                var change=index-mergeNumber;
                var num=parseInt(value.num);

                self.matrix[row][col]=0;
                self.matrix[change][col]=num;

                if (index>=1){
                    var isMerge=self.isMerge(card,change,col,"up");

                    if (!!isMerge){
                        mergeNumber++;
                        self.updateScore(num);
                        var callback=function () {
                            var up=cols[index-1].element;
                            self.mergeAnimate(up);
                            self.cardsDom.removeChild(card);
                            cols.slice(index,1);
                            up.innerHTML=2*num;
                            up.classList.remove('cardNum-'+num);
                            up.classList.add('cardNum-'+2*num);
                        }
                    }
                }
                self.moveAnimate(card,"top",change,change+"-"+col,callback);


            })





        });

    };
    var down=function () {
        var cardObject=collectionCards("col");
        var rowsKeys=Object.keys(cardObject);

        rowsKeys.forEach(function (t) {
            var cols=cardObject[t].reverse();
            var col=parseInt(t);
            var mergeNumber=0;
            cols.forEach(function (value,index) {
                var card=value.element;
                var row=value.row;
                var change=3-index+mergeNumber;
                var num=parseInt(value.num);

                self.matrix[row][col]=0;
                self.matrix[change][col]=num;

                if (index>=1){
                    var isMerge=self.isMerge(card,change,col,"down");

                    if (!!isMerge){
                        mergeNumber++;
                        self.updateScore(num);
                        var callback=function () {
                            var down=cols[index-1].element;
                            self.mergeAnimate(down);
                            self.cardsDom.removeChild(card);
                            cols.slice(index,1);
                            down.innerHTML=2*num;
                            down.classList.remove('cardNum-'+num);
                            down.classList.add('cardNum-'+2*num);
                        }
                    }
                }
                self.moveAnimate(card,"top",change,change+"-"+col,callback);

            })
        });
    };
    return{
        left:left,
        right:right,
        up:up,
        down:down
    }
};
 game2048.updateScore=function (score) {
    this.toast("+"+score,1000);
    this.score+=parseInt(score);
    this.scoreDiv.innerHTML=this.score;
};
 game2048.moveAnimate=function (node,option,val,newPosition) {
    var step=(val*80-parseInt(node.style[option],10));
    step=10*step/Math.abs(step);
    var callbacks=Array.prototype.slice.call(arguments,4);

    function move() {

        if (node.style[option]!==val*80+"px"){
            node.style[option]=(parseInt(node.style[option],10))+step+"px";
            requestAnimationFrame(move);
        }else {
            cancelAnimationFrame(move);
            node.setAttribute("data-position",newPosition);
            if (callbacks.length){
                callbacks.forEach(function (value) {
                    value && value();
                    value=null;
                })
            }
            node=null;
        }
    }
    move();
};
 game2048.isMerge=function (node,row,col,dir) {
    var flag=false;
    switch (dir){
        case "left":
            flag=this.matrix[row][col]===this.matrix[row][col-1];
            if (flag){
                this.matrix[row][col]=0;
                this.matrix[row][col-1]*=2
            }
            break;

        case "right":
            flag= this.matrix[row][col]===this.matrix[row][col+1];
            if (flag){
                this.matrix[row][col]=0;
                this.matrix[row][col+1]*=2
            }
            break;

        case "down":
            flag= this.matrix[row][col]===this.matrix[row+1][col];
            if (flag){
                this.matrix[row][col]=0;
                this.matrix[row+1][col]*=2;
            }
            break;

        case "up":
            flag= (this.matrix[row][col]===this.matrix[row-1][col]);
            if (flag){
                this.matrix[row][col]=0;
                this.matrix[row-1][col]*=2;
            }
            break;
        default:
            break;
    }

    return flag;

};
 game2048.mergeAnimate=function (node) {
    var step=0.02;
    var flag=true;
    function amplify() {
        var tranform=window.getComputedStyle(node).transform.split('(')[1].split(')')[0].split(',');
        var scale=parseFloat(tranform[0]);
        var newScale;
        if (scale<1.2 && flag===true){
            newScale=scale+step;
            node.style.transform='scale('+newScale+')';
            requestAnimationFrame(amplify);
        }else if (scale===1.2 && flag===true){
            flag=false;
            newScale=scale-step;
            node.style.transform='scale('+newScale+')';
            requestAnimationFrame(amplify);
        }else if (scale>1 && scale<=1.2 && flag===false){
            flag=false;
            newScale=scale-step;
            node.style.transform='scale('+newScale+')';
            requestAnimationFrame(amplify);
        } else if (scale===1 && flag===false){
            cancelAnimationFrame(amplify);
            node=null;
        }

    }
    amplify();
};

window.onload=function () {

    game2048.init();
    document.querySelector(".start").onclick=function (event) {

        if (event.target.nodeName.toLowerCase()!=="button"){
            return false
        }
        game2048.coverDom.classList.add("hide");
        game2048.reStart.call(game2048);
    };

};

