var startX;
var startY;
var endX;
var endY;
var dx;
var dy;
var timer;
var main=document.querySelector("#gamePanel");
var scoreDiv=document.querySelector("#score");
var best=document.querySelector("#best");

var matrix=[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
var score=0;
var btn=document.querySelector("button.start");
btn.onclick=function (event) {
    event.preventDefault();
    init();
    var cover=document.querySelector("#cover");
    cover.classList.add("hide");
};

window.onload=function () {

    var createDiv=function (row,col) {
        var div=document.createElement("div");
        div.classList.add("cell");
        div.classList.add("cell-"+row+"-"+col);
        div.style.left=row*80+"px";
        div.style.top=col*80+"px";
        main.appendChild(div);
    };

    for(var i=0;i<4;i++){
        for (var j=0;j<4;j++){
            createDiv(i,j);
        }
    }

    init();
};

function gameOver(msg) {
    var cover=document.querySelector("#cover");
    cover.innerHTML=msg;
    cover.classList.remove("hide");
    var best=window.localStorage.getItem("best");
    best=best>score?best:score;
    window.localStorage.setItem("best",best);
}
function isOver() {
    for (var i=0;i<4;i++){
        for (var j=0;j<4;j++){
            if (matrix[i][j]===0){
                return false;
            }
        }
    }
    gameOver("Game Over!");
    toast('Game Over!', 4000);
    return true;
}
function createCard(num,row,col) {
    matrix[row][col]=num;
    var div=document.createElement("div");
    div.classList.add("cardNum");
    div.classList.add("cardNum-"+num);
    var position="-"+row+"-"+col;
    div.classList.add("position"+position);
    div.innerHTML=num;
    main.appendChild(div);

}

function randomPosition() {
    var randomP=function () {
        return Math.floor(Math.random()*4)+"-"+Math.floor(Math.random()*4);
    };

    var inner=function () {
        return Math.random()>0.5?2:4
    };

    var one=randomP();
    var row=parseInt(one.split("-")[0]);
    var col=parseInt(one.split("-")[1]);
    if (matrix[row][col]===0){
        timer=null;
        timer=setTimeout(function () {
            createCard(inner(),row,col);
        },500);
        return true;
    }else {
        return randomPosition();
    }

}
function firstShow() {
    var one=randomPosition();
    var two=randomPosition();

    if (one===two){
        firstShow();
    }else {
        return true;
    }
}
function init() {
    matrix=[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    score=0;
    best.innerHTML=window.localStorage.getItem("best");
    scoreDiv.innerHTML=score;
    var cards=main.querySelectorAll(".cardNum");

    if(cards.length>0){
        cards.forEach(function (t) {
            main.removeChild(t)
        })
    }
    firstShow();
    handleTouchEvent()
}


function handleTouchEvent() {
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

        if (score>=2048){
            gameOver("Winner");
            toast("You win the game",4000);
        }else {
            if (dy<0 &&Math.abs(dy)>Math.abs(dx)){
                console.log("up");
                moveUp();
            }else  if (dy>0 &&Math.abs(dy)>Math.abs(dx)){
                console.log("down");
                moveDown();
            }else  if (dx<0 &&Math.abs(dx)>Math.abs(dy)){
                console.log("left");
                moveLeft();
            }else if (dx>0 &&Math.abs(dx)>Math.abs(dy)){
                console.log("right");
                moveRight();
            }
            isOver();

        }





    }
    main.addEventListener("touchstart",touchStart,false);
    main.addEventListener("touchmove",touchMove,false);
    main.addEventListener("touchend",touchEnd,false);

}
function getPoition(node) {
    var classListsString=node.classList.toString();
    var positionString=classListsString.substring(classListsString.indexOf("position-"));
    var positionArrary=positionString.split("-");
    return [positionArrary[1],positionArrary[2]]
}

function collectionCards(option) {
    var cards=main.querySelectorAll(".cardNum");
    cards=Array.prototype.slice.call(cards);

    var cardObject={};
    cards.forEach(function (t) {
        var position=getPoition(t);
        var row=position[0];
        var col=position[1];

        if (option==="row"){
            if (cardObject[row]===undefined){
                cardObject[row]=[];
            }
            cardObject[row].push({
                col:col,
                element:t,
                num:t.innerHTML
            });
        }else  if (option==="col"){
            if (cardObject[col]===undefined){
                cardObject[col]=[];
            }
            cardObject[col].push({
                row:row,
                element:t,
                num:t.innerHTML
            });
        }


    });
    return cardObject;
}


function moveLeft() {

    var cardObject=collectionCards("row");
    var rowsKeys=Object.keys(cardObject);

    rowsKeys.forEach(function (t) {

        var rows=cardObject[t];

        var row=parseInt(t);

        if (rows.length>1){
            rows=rows.sort(function (p1,p2) {
                return p1.col>p2.col?1:-1;
            });
        }
        for (var i=0;i<rows.length;i++){
            var card=rows[i];
            var col=rows[i].col;
            var change=i;
            var num=rows[i].num;

            matrix[row][col]=0;
            matrix[row][change]=num;


             if (i>=1){
                if (matrix[row][change-1]===matrix[row][change]){
                    matrix[row][change-1]=2*num;
                    matrix[row][change]=0;

                    card.element.classList.remove("cardNum-"+num);
                    card.element.classList.add("cardNum-"+num*2);
                    card.element.innerHTML=num*2;

                    main.removeChild(rows[i-1].element);
                    rows.splice(i-1,1);
                    i--;
                    change=change-1;
                    toast('+'+num*2, 1000);
                    score+=parseInt(num);
                    scoreDiv.innerHTML=score;
                }
            }


            card.element.classList.remove("position-"+row+"-"+col);
            card.element.classList.add("position-"+row+"-"+change);


        }




    });


    randomPosition();

}

function moveRight() {


    var cardObject=collectionCards("row");

    var rowsKeys=Object.keys(cardObject);

    rowsKeys.forEach(function (t) {

        var rows=cardObject[t];

        var row=parseInt(t);

        if (rows.length>1){
            rows=rows.sort(function (p1,p2) {
                return p1.col>p2.col?-1:1;
            });
        }

        for (var i=0;i<rows.length;i++){
            var card=rows[i];
            var col=rows[i].col;
            var change=3-i;
            var num=rows[i].num;

            matrix[row][col]=0;
            matrix[row][change]=num;
            if (i>=1){
                if (matrix[row][change+1]===matrix[row][change]){
                    matrix[row][change+1]=2*num;
                    matrix[row][change]=0;
                    card.element.classList.remove("cardNum-"+num);
                    card.element.classList.add("cardNum-"+num*2);
                    card.element.innerHTML=num*2;
                    main.removeChild(rows[i-1].element);
                    rows.splice(i-1,1);
                    i--;
                    change=change+1;
                    toast('+'+num*2, 1000);
                    score+=parseInt(num);
                    scoreDiv.innerHTML=score;

                }
            }

            card.element.classList.remove("position-"+row+"-"+col);
            card.element.classList.add("position-"+row+"-"+change);
        }

    });


    randomPosition();
}
function moveUp() {


    var cardObject=collectionCards("col");

    var rowsKeys=Object.keys(cardObject);

    rowsKeys.forEach(function (t) {

        var cols=cardObject[t];

        var col=parseInt(t);

        if (cols.length>1){
            cols=cols.sort(function (p1,p2) {
                return p1.row > p2.row ? 1:-1;
            });

        }

        for (var i=0;i<cols.length;i++){
            var card=cols[i];
            var row=card.row;
            var change=i;
            var num=card.num;

            matrix[row][col]=0;
            matrix[change][col]=num;
            if (i>=1){

                if (matrix[change-1][col]===matrix[change][col]){
                    matrix[change-1][col]=2*num;
                    matrix[change][col]=0;
                    card.element.classList.remove("cardNum-"+num);
                    card.element.classList.add("cardNum-"+num*2);
                    card.element.innerHTML=num*2;
                    main.removeChild(cols[i-1].element);
                    change=change-1;
                    cols.splice(i-1,1);
                    i--;
                    toast('+'+num*2, 1000);
                    score+=parseInt(num);
                    scoreDiv.innerHTML=score;
                }
            }

            card.element.classList.remove("position-"+row+"-"+col);
            card.element.classList.add("position-"+change+"-"+col);
        }

    });


    randomPosition();
}

function moveDown() {


    var cardObject=collectionCards("col");

    var rowsKeys=Object.keys(cardObject);

    rowsKeys.forEach(function (t) {

        var cols=cardObject[t];

        var col=parseInt(t);

        if (cols.length>1){
            cols=cols.sort(function (p1,p2) {
                return p1.row > p2.row ? -1:1;
            });

        }

        for (var i=0;i<cols.length;i++){
            var card=cols[i];
            var row=card.row;
            var change=3-i;
            var num=card.num;

            matrix[row][col]=0;
            matrix[change][col]=num;
            if (i>=1){
                if (matrix[change+1][col]===matrix[change][col]){
                    matrix[change+1][col]=2*num;
                    matrix[change][col]=0;
                    card.element.classList.remove("cardNum-"+num);
                    card.element.classList.add("cardNum-"+num*2);
                    card.element.innerHTML=num*2;
                    main.removeChild(cols[i-1].element);
                    change=change+1;
                    cols.splice(i-1,1);
                    i--;
                    toast('+'+num*2, 1000);
                    score+=parseInt(num);
                    scoreDiv.innerHTML=score;
                }
            }

            card.element.classList.remove("position-"+row+"-"+col);
            card.element.classList.add("position-"+change+"-"+col);
        }

    });

    randomPosition();
}

function toast(message,interval) {
    var div=document.createElement("div");
    div.classList.add("toast");
    div.innerHTML=message;
    document.body.appendChild(div);

    setTimeout(function () {
        document.body.removeChild(div);
        div=null;
    },interval)


}