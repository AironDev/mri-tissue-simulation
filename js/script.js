function restart_pic(id, src) { //restart animated gif
    document.getElementById(id).src = "";

    setTimeout(function () { restart_pic2(id, src); }, 10); //need a delay for IE, for some reason...
}

function restart_pic2(id, src) {
    document.getElementById(id).src = src;
}

/*var grayT1 = 760; //values taken from Hashemi book
var grayT2 = 77;
var grayN = 0.69;
var whiteT1 = 510;
var whiteT2 = 67;
var whiteN = 0.61;
var csfT1 = 2650;
var csfT2 = 180;
var csfN = 1;*/

// constants for experiments Melhem AJNR 1997
var grayT1 = 940; var grayT2 = 100; var grayN = 0.75; //from Melhem AJNR 1997
var whiteT1 = 550; var whiteT2 = 90; var whiteN = 0.65;
var csfT1 = 4210; var csfT2 = 2100; var csfN = 1;

var imagesLoaded = 0;

var imCSF = new Image();
imCSF.onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 3) {
        calcSignal();
    }
}
imCSF.src = "csf.png";


var imGray = new Image();
imGray.onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 3) {
        calcSignal();
    }
}
imGray.src = "gray.png";


var imWhite = new Image();
imWhite.onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 3) {
        calcSignal();
    }
}
imWhite.src = "white.png";




//calculate MR signal, weighting given TR, TE, (TI)
function calcSignal() {

//    document.getElementById('imwhite').src = imWhite.src
//    document.getElementById('imgray').src = imGray.src
//    document.getElementById('imcsf').src = imCSF.src

    

    var TR = parseInt(document.getElementById('TR').value);
    var TE = parseInt(document.getElementById('TE').value);
    var IR = document.getElementById('IR').checked;
    var TI = parseInt(document.getElementById('TI').value);

    var signalGray, signalWhite, signalCSF; // declare t3 variables

    // if not checked
    if (!IR) {

        signalGray = grayN * (1 - Math.exp(-TR / grayT1)) * Math.exp(-TE / grayT2);

        signalWhite = whiteN * (1 - Math.exp(-TR / whiteT1)) * Math.exp(-TE / whiteT2);

        signalCSF = csfN * (1 - Math.exp(-TR / csfT1)) * Math.exp(-TE / csfT2);
        
    } else { //IR sequence
        signalGray = grayN * (1 - 2 * Math.exp(-TI / grayT1) + Math.exp(-TR / grayT1)) * Math.exp(-TE / grayT2);
        signalWhite = whiteN * (1 - 2 * Math.exp(-TI / whiteT1) + Math.exp(-TR / whiteT1)) * Math.exp(-TE / whiteT2);
        signalCSF = csfN * (1 - 2 * Math.exp(-TI / csfT1) + Math.exp(-TR / csfT1)) * Math.exp(-TE / csfT2);

        //magnitude reconstruction - make absolute values here
        signalGray = Math.abs(signalGray);
        signalWhite = Math.abs(signalWhite);
        signalCSF = Math.abs(signalCSF);
    }

    // add all signals
    var signalSum = signalGray + signalWhite + signalCSF;


    document.getElementById('gray').value = Math.round(signalGray * 100);
    document.getElementById('white').value = Math.round(signalWhite * 100);
    document.getElementById('csf').value = Math.round(signalCSF * 100);

    var t1weight;
    if (!IR) {
        t1weight = (TR / grayT1) / (1 - Math.exp(TR / grayT1));
    } else {
        t1weight = (-2 * (TI / grayT1) * Math.exp(-TI / grayT1) + (TR / grayT1) * Math.exp(-TR / grayT1)) / (1 - 2 * Math.exp(-TI / grayT1) + Math.exp(-TR / grayT1));
    }
    var t2weight = TE / grayT2;
    var nweight = 1;
    var sum = Math.abs(t1weight) + t2weight + nweight;

    document.getElementById('t1w').value = Math.round(Math.abs(t1weight) / sum * 100);
    document.getElementById('t2w').value = Math.round(t2weight / sum * 100);
    document.getElementById('nw').value = Math.round(nweight / sum * 100);

    //draw brain
    var canvas = document.getElementById('mri_canvas');
    var context = canvas.getContext("2d");
    //context.fillStyle = "#000000";
    context.fillRect(0, 0, 350, 350);

    context.save();
    context.globalAlpha = signalWhite / signalSum; //apply transparency based on  calc
    context.drawImage(imWhite, 150 - imWhite.width / 2, 0);
    context.restore();

    context.save();
    context.globalAlpha = signalGray / signalSum; //apply transparency based on  calc
    context.drawImage(imGray, 150 - imGray.width / 2, 0);
    context.restore();

    context.save();
    context.globalAlpha = signalCSF / signalSum; //apply transparency based on  calc
    context.drawImage(imCSF, 150 - imCSF.width / 2, 0);
    context.restore();
}

//enable or disable IR pulse
function setIR() {
    var checked = document.getElementById('IR').checked;
    if (checked) {
        document.getElementById('TI').disabled = false;
        document.getElementById('TI').value = 1800;
    } else {
        document.getElementById('TI').disabled = true;
        document.getElementById('TI').value = 0;
    }

    calcSignal();
}

//use some preset values for TR/TE/TI on page load
function selectPreset() {
    var selected = document.getElementById('presets').value;
    if (selected == 1) { //t1
        document.getElementById('TR').value = 500;
        document.getElementById('TE').value = 20;
        document.getElementById('IR').checked = false;
        document.getElementById('TI').value = 0;
        document.getElementById('TI').disabled = true;
    } else if (selected == 2) { //t2
        document.getElementById('TR').value = 2800;
        document.getElementById('TE').value = 90;
        document.getElementById('IR').checked = false;
        document.getElementById('TI').value = 0;
        document.getElementById('TI').disabled = true;
    } else if (selected == 3) { //t1 flair
        document.getElementById('TR').value = 2000;
        document.getElementById('TE').value = 10;
        document.getElementById('IR').checked = true;
        document.getElementById('TI').value = 860;
        document.getElementById('TI').disabled = false;
    } else if (selected == 4) { //t2 flair
        document.getElementById('TR').value = 6000;
        document.getElementById('TE').value = 160;
        document.getElementById('IR').checked = true;
        document.getElementById('TI').value = 2000;
        document.getElementById('TI').disabled = false;
    }

    calcSignal();
}

function showhide(el) {
    var disp = document.getElementById(el).style.display;
    if (disp == "none") {
        document.getElementById(el).style.display = "inline";
    } else {
        document.getElementById(el).style.display = "none";
    }
}