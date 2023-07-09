import * as THREE from "three";
import { PointLightHelper } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let position = 1;
let canScroll = true;

$(function() {

    //--------------------Mobile or Desktop--------------------    
    
    switchTouchScrollMode();
    
    //--------------------Three JS--------------------
    
    let windowHeight;
    let windowWidth;
    let scene;
    let camera;
    let renderer;
    let is3DModelLoaded = false;
    let is3DAnimating = true;
    const loadingScreen = $(".loader");
    
    $(window).on("resize", onWindowResize);
    onWindowResize();

    function init(canvas, model){
        console.log("//--------------------Init of threejs#1--------------------")

        windowHeight = $(canvas).height();
        windowWidth = $(canvas).width();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(25, windowWidth / windowHeight, 0.1, 100);

        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector(canvas),
            antialias: true,
            alpha: true,
        });

        //on définit une position par défaut
        camera.position.setZ(20);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(windowWidth, windowHeight);
        // renderer.toneMapping = THREE.ReinhardToneMapping;
        // renderer.shadowMap.enabled = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setClearColor(0x000000, 0);

        // const controls = new OrbitControls(camera, renderer.domElement);

        const loadingManager = new THREE.LoadingManager(() => {
            loadingScreen.addClass("fade-out");

            let menuSpaceSize = $(".menu").width();
            $(".menu").get(0).style.setProperty("--menuHideMargin", (-(menuSpaceSize - 204.33) / 6) + "px");

            updateAnimation(position);
            onWindowResize();
        });

        const pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.setY(5);
        pointLight.position.setX(2);
        pointLight.position.setZ(5);
        scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        scene.add(pointLight, ambientLight);

        const pointLightHelper = new THREE.PointLightHelper(pointLight);

        const gridHelper = new THREE.GridHelper(200, 50);
        // scene.add(gridHelper, pointLightHelper);


        var base = new THREE.Object3D();
        scene.add(base);

        const loader = new GLTFLoader(loadingManager);

        loader.load("./style/3d/"+model, function (gltf) {
            let model = gltf.scene;

            base.add(model);
            model.position.setY(-3);
            model.scale.set(2, 2, 2);
            is3DModelLoaded = true;
            console.log("//--------------------Done--------------------");

        }, undefined, function (error) {
            console.error(error);
            console.log("//--------------------Error--------------------");
        });


        var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3);
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        var pointOfIntersection = new THREE.Vector3();
        var timer;

        $(window).on("mousemove", function (event) {
            if(position == 1){
                is3DAnimating = true;

                let windowWidth = $(window).width()/1000;
                let windowIntersectionPointOffset = -0.228*windowWidth+2.548;

                mouse.x = (event.clientX / window.innerWidth) * 3 - windowIntersectionPointOffset;
                mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                raycaster.ray.intersectPlane(plane, pointOfIntersection);
                base.lookAt(pointOfIntersection);

                clearTimeout(timer);
                timer = setTimeout(stopRender, 100);
            }
        });

        function stopRender(){
            is3DAnimating = false;
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            if(position == 1 && is3DAnimating){
                renderer.render(scene, camera);
            }
        }

        animate();
    }

    //--------------------Scroll Animation--------------------


    // Define dot size and color array
    const dotSize = 15;
    const colors = [
    "#ff9100",
    "#ff0000",
    "#555555",
    "#0055ff",
    "#ff9100",
    "#3ee057",
    "#a533af"
    ];
    // Set initial values for animation variables and menu size
    let isDotAnimating = false;
    let dotAnimationSize = dotSize * 3;
    let dotPosition = 0;
    let menuSpaceSize = $(".menu").width();
    // Set dot size using CSS property
    $("#dots").get(0).style.setProperty("dotSize", `${dotSize}px`);
    // Show first section element
    $("div[data-position=1]").addClass("showUp");
    // Hide all other menu elements
    hideMenuElements();

    //Main animator--------------------
    $("body").on("wheel", function (event) {
        if (!isDotAnimating && canScroll) {
            //mettre à false pour supprimer les intervalles entre chaque animation
            isDotAnimating = true;

            //scroll UP

            hideMenuElements();

            if (event.originalEvent.deltaY < 0) {
                if (position == 1) {
                    $("div[data-position=" + position + "]").addClass("hideUp").removeClass("showUp").removeClass("showDown");
                    $("div[data-position=" + (position + 1) + "]").addClass("showUp");
                } else {
                    $("div[data-position=" + position + "]").addClass("hideDown").removeClass("showUp").removeClass("showDown");
                    $("div[data-position=" + (position - 1) + "]").addClass("showDown");
                }

                switch (position) {
                    case 1:
                        dotDown();
                        break;
                    case 3:
                        showHideDot($("#dotGray"), false);
                        dotUp();
                        break;
                    case 4:
                        showHideDot($("#dotGray"), true);
                        updateDotColor(position - 2);
                        position--;
                        $(".menu span:nth-child(3)").addClass("activeMenuElement").removeClass("hideMenuElement");
                        break;
                    case 5:
                        showHideDot($("#dotOrange"), false);
                        dotUp();
                        break;
                    case 6:
                        showHideDot($("#dotOrange"), true);
                        updateDotColor(position - 2);
                        position--;
                        $(".menu span:nth-child(5)").addClass("activeMenuElement").removeClass("hideMenuElement");
                        break;
                    default:
                        dotUp();
                        break;
                }

                //scroll DOWN
            } else if (event.originalEvent.deltaY > 0) {
                if (position == 7) {
                    $("div[data-position=" + position + "]").addClass("hideDown").removeClass("showUp").removeClass("showDown");
                    $("div[data-position=" + (position - 1) + "]").addClass("showDown");
                } else {
                    $("div[data-position=" + position + "]").addClass("hideUp").removeClass("showUp").removeClass("showDown");
                    $("div[data-position=" + (position + 1) + "]").addClass("showUp");
                }

                switch (position) {
                    case 2:
                        showHideDot($("#dotGray"), true);
                        dotDown();
                        $(".menu span:nth-child(3)").addClass("activeMenuElement").removeClass("hideMenuElement");
                        break;
                    case 3:
                        showHideDot($("#dotGray"), false);
                        updateDotColor(position);
                        position++;
                        break;
                    case 4:
                        showHideDot($("#dotOrange"), true);
                        dotDown();
                        $(".menu span:nth-child(5)").addClass("activeMenuElement").removeClass("hideMenuElement");
                        break;
                    case 5:
                        showHideDot($("#dotOrange"), false);
                        updateDotColor(position);
                        position++;
                        break;
                    case 7:
                        dotUp();
                        break;
                    default:
                        dotDown();
                        break;
                }

            }

            updateMenuElement();
            updateAnimation(position);
        

            // console.log(`scroll pos: ${position}`);
            // console.log(`dotPos: ${dotPosition}`);
        }
    });

    //Updates section position on click
    $("*[data-dotNumber]").on("click", function () {
        if(!isTouchDevice()){
            let dotNumber = $(this).attr("data-dotNumber");
            let dotPositionNumber = parseInt($(this).attr("data-dotPosition"));
    
            showHideDot("#dotGray", false);
            showHideDot("#dotOrange", false);
    
            hideMenuElements();
    
    
            //DOWN
            if (dotPositionNumber > position) {
                dotAnimationSize = dotSize * (2 * dotNumber - 1) - dotPosition;
                dotPosition = 2 * dotSize * (dotNumber - 2);
    
                $("div[data-position=" + (position) + "]").addClass("hideUp").removeClass("showUp").removeClass("showDown");
                $("div[data-position=" + (dotPositionNumber) + "]").addClass("showUp");
    
                position = dotPositionNumber - 1;
    
                dotDown();
    
                position = dotPositionNumber;
            //UP
            } else if (dotPositionNumber < position) {
                dotAnimationSize = dotPosition - (dotNumber - 1) * dotSize * 2 + dotSize;
    
                $("div[data-position=" + position + "]").addClass("hideDown").removeClass("showUp").removeClass("showDown");
                $("div[data-position=" + (dotPositionNumber) + "]").addClass("showDown");
    
                position = dotPositionNumber + 1;
    
                dotUp();
    
                dotPosition = (dotNumber - 1) * dotSize * 2;
    
                position = dotPositionNumber;
    
            }
    
            updateMenuElement();
            updateAnimation(position);
        }
    });

    $("div[data-position]").on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function () {
        $(this).removeClass("hideUp").removeClass("hideDown");
    });

    $(".movingDot, #dotGray").on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function () {
        isDotAnimating = false;
        dotAnimationSize = dotSize * 3;

        $(".movingDot").removeClass("moveDotDown").removeClass("moveDotUp").removeClass("colorChange");

        $("#dots").get(0).style.setProperty("--prevDotColor", `${colors[position - 1]}`);
    });
    
    //--------------------Réalisations--------------------

    $(".moving-list>.card-blue").on({
        "mouseenter": function (){
            let phone = $("div[data-position='4'] .col-5");
            let card = $(this).attr("id");
            switch (true){
                case (card == "card-1"):
                    console.log(("card 1"))
                    phone.css("background-image", "url(./style/images/phoneEcoPrint.webp");
                    break;
                case (card == "card-2"):
                    phone.css("background-image", "url(./style/images/phoneDailyCode.webp");
                    break;
                case (card == "card-3"):
                    phone.css("background-image", "url(./style/images/phoneNixels.webp");
                    break;
            }
        }
    });

    $(".moving-list").on({
        "mouseenter": function(){
            canScroll = false;
        },
        "mouseleave": function(){
            if(!isTouchDevice()){
                canScroll = true;
            }
        }
    });
    
    //--------------------Notre équipe--------------------

    let leftOrRight;
    let currentSliderPosition = 0;
    $(".arrow>i").on("click", function(){

        leftOrRight = $(this).attr("data-arrow-direction");

        if(leftOrRight == "left" && currentSliderPosition < 0){
            currentSliderPosition += 500;
        }else if(leftOrRight == "right" && currentSliderPosition > -2500){
            currentSliderPosition -= 500;
        }


        $("*[data-arrow-direction='left'], *[data-arrow-direction]").addClass("active");
        if(currentSliderPosition == 0){
            $("*[data-arrow-direction='left']").removeClass("active");
        }else if(currentSliderPosition == -2500){
            $("*[data-arrow-direction='right']").removeClass("active");
        }

        console.log(currentSliderPosition);
        $(".slider").css("left", currentSliderPosition + "px");

    });
    
    //Change contact form background on double click
    $("div[data-position='7']").on("dblclick", function(){
        $(this).css("background-image", "url(./style/images/noBlur.png");
    });

    //Change portfolio smartphone repeat on double click
    $("div[data-position='4'] .col-5").on("dblclick", function(){
        $(this).css("background-repeat", "no-repeat");
    });

    //Remove tab on all sections but not from contact form
    $("body").on("keydown", function (event) {
        if (event.key == "Tab" && position != 7) {
            event.preventDefault();
        }
    });

    //--------------------Contact form--------------------

    let formIsValid = false;
    $(".form input, .form textarea").on("keyup", function(){
        let name = $(this).attr("name");
        let val = $(this).val();
        $(this).removeClass("valid");

        let minimumNameLengthRegex = /^.{3,}-?$/g;
        let areForbiddenCharactersRegex = /^[A-zÀ-ú]{3,12}-?[A-zÀ-ú]{0,12}$/g;
        let isEmailValidRegex = /^[A-zÀ-ú]+.?[A-zÀ-ú]+\@[A-zÀ-ú]+\.[A-zÀ-ú]+$/;

        switch (name){
            case "nom":
                $(this).css("border-bottom", "2px solid red");
                if(!minimumNameLengthRegex.test(val)){
                    showError(name, "(1) 3 caractères minimum requis.", true);
                }else if(!areForbiddenCharactersRegex.test(val)){
                    showError(name, "(1) Caractères acceptés : A-z À-ú et '-'", true);
                }else{
                    $(this).css("border-bottom", "2px solid #3ee057");
                    $(this).addClass("valid");
                    showError(name, "&nbsp", false);
                }

                if(val == ""){
                    showError(name, "&nbsp", false);
                    $(this).css("border-bottom", "2px solid #a533af");
                }
                break;
            case "prenom":
                $(this).css("border-bottom", "2px solid red");
                if(!minimumNameLengthRegex.test(val)){
                    showError(name, "(2) 3 caractères minimum requis.", true);
                }else if(!areForbiddenCharactersRegex.test(val)){
                    showError(name, "(2) Caractères acceptés : A-z À-ú et '-'", true);
                }else{
                    $(this).css("border-bottom", "2px solid #3ee057");
                    $(this).addClass("valid");
                    showError(name, "&nbsp", false);
                }

                if(val == ""){
                    showError(name, "&nbsp", false);
                    $(this).css("border-bottom", "2px solid #a533af");
                }
                break;
            case "email":
                $(this).css("border-bottom", "2px solid red");
                if(!isEmailValidRegex.test(val)){
                    showError(name, "(3) Adresse email non valide.", true);
                }else{
                    $(this).css("border-bottom", "2px solid #3ee057");
                    $(this).addClass("valid");
                    showError(name, "&nbsp", false);
                }

                if(val == ""){
                    showError(name, "&nbsp", false);
                    $(this).css("border-bottom", "2px solid #a533af");
                }
                break;
            case "message":
                $(this).css("border-bottom", "2px solid red");

                if(!minimumNameLengthRegex.test(val)){
                    showError(name, "(4) 3 caractères minimum requis.", true);
                }else{
                    $(this).css("border-bottom", "2px solid #3ee057");
                    $(this).addClass("valid");
                    showError(name, "&nbsp", false);
                }

                if(val == ""){
                    showError(name, "&nbsp", false);
                    $(this).css("border-bottom", "2px solid #a533af");
                }
                break;
        }

        if($(".form .valid").length == $(".form input, .form textarea").length){
            formIsValid = true;
            $("div[data-position=7] .button").removeClass("button-purple").addClass("button-green").css("cursor", "pointer");
        }else{
            formIsValid = false;
            $("div[data-position='7'] .button").addClass("button-purple").removeClass("button-green").css("cursor", "auto");
        }

        function showError(name, message, show){
            $(`.form .${name}-error`).html(message);
            $(`.form .${name}-error`).toggleClass("showError", show);
        }
    })

    $(".form+input[type=submit]").on("click", function(){
        if(formIsValid){
            $(".form").trigger('submit');
        }
    });

    var request;
    $("#form").on("submit", function(event){
        event.preventDefault();

        if(request){
            request.abort();
        }

        let $form = $(this);
        let $inputs = $form.find("input, textarea");
        let serializedData = $("#form").serialize();

        $inputs.prop("disabled", true);

        request = $.post("./send_email/contact.php", serializedData)
            .done(function(response){
                $("input[type=submit]")
                .prop("disabled", true)
                .val("Envoyé");
                console.log("Done !");
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                $("input[type=submit]")
                .val("Erreur");
                console.error(
                    "The following error occurred: " + textStatus, errorThrown
                );
            })
            .always(function(){
                $inputs.prop("disabled", false);
                $(".form input, .form textarea").off("keyup");
            })
    });

    //-----------------------------(⌐■_■)-------------------------------

    function onWindowResize() {
        $(".menu").get(0).style.setProperty("--menuHideMargin", (-($(".menu").width() - 204.33) / 6) + "px")

        skipOrInit3D();
        if(is3DModelLoaded){
            is3DAnimating = true;

            const width = $(".canvas").width();
            const height = $(".canvas").height();
    
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            camera.position.setZ((1 - camera.aspect)*65);
    
            renderer.setSize(width, height);

        }

        switchTouchScrollMode();
    }

    function skipOrInit3D(){
        if(!is3DModelLoaded){
            if($(window).width() >= 992){
                init('.threejs-1', 'animal3.gltf');
            }else{
                console.log("//--------------------ThreeJS skipped--------------------")
                //If no threejs, hide loading screen
                loadingScreen.addClass("fade-out");
    
                if(!isTouchDevice()){
                    updateAnimation(position);
                }
            }
        }
    }

    function switchTouchScrollMode(){
        if(isTouchDevice()){
            //Trigger animation for all .animate class because it's mobile version
            $(".animate").addClass("in-viewport");

            $("#main").addClass("start-scroll").removeClass("stop-scroll");
            
            canScroll = false;

            $(".button-orange>a").attr("href", "#data-position-2");
            $(".button-green>a").attr("href", "#data-position-7");

        }else{
            $(".animate").removeClass("in-viewport");

            $("#main").removeClass("start-scroll").addClass("stop-scroll");

            canScroll = true;


            $(".button-orange").removeAttr("href");
            $(".button-green").removeAttr("href");


            updateAnimation(position);
        }
    }

    function isTouchDevice() {
        return (('ontouchstart' in window)
            || (navigator.maxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0));
    }

    function updateAnimation(position){
        $(".animate").removeClass("in-viewport");
        $(`div[data-position=${position}]`).find(".animate").addClass("in-viewport");
    }

    function updateMenuElement() {
        $(".menu").get(0).style.setProperty("--menuColor", colors[position - 1]);
        $(".menu span").removeClass("activeMenuElement");
        $(".menu span:nth-child(" + position + ")").addClass("activeMenuElement");
    }

    function hideMenuElements() {
        $(".menu span:nth-child(3), .menu span:nth-child(5)").removeClass("activeMenuElement").addClass("hideMenuElement");
    }

    function showHideDot(dot, showHide) {
        $(dot).toggleClass("showDot", showHide).toggleClass("hideDot", !showHide);
    }

    function dotDown() {
        dotPosition += dotSize * 2;
        updateDot(position, dotPosition, false);
        position++;
    }

    function dotUp() {
        updateDot(position - 2, dotPosition, true);
        dotPosition -= dotSize * 2;
        position--;
    }

    function updateDotColor(newPosition) {
        $("#dots").get(0).style.setProperty("--dotColor", colors[newPosition]);
        $(".movingDot").addClass("colorChange");

    }

    //reverse = true = UP
    //reverse = false = DOWN
    function updateDot(newPosition, newDotPosition, reverse) {
        $("#dots").get(0).style.setProperty("--dotPosition", `${newDotPosition}px`);


        $("#dots").get(0).style.setProperty("--dotColor", `${colors[newPosition]}`);

        $("#dots").get(0).style.setProperty("--dotAnimationSize", `${dotAnimationSize}px`);


        $(".movingDot").toggleClass("moveDotDown", !reverse)
            .toggleClass("moveDotUp", reverse)
            .css({
                "top": `${newDotPosition - ((reverse) && dotAnimationSize - dotSize)}px`
            });

    }

})