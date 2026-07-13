// ==UserScript==
// @name         ProActivaNet Mario Mods
// @namespace    ProactivaNet
// @version      2026-07-13
// @description  Modificaciones de Mario para proActivaNet
// @author       Hirkkak
// @match        */proactivanet/servicedesk/incidents/formIncidents/formIncidents.paw*
// @match        */proactivanet/servicedesk/incidents/allIncidents/allIncidents.paw*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=147.39
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
//
// @require      https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetModsHelper.js
// @supportURL   https://github.com/hirkkak/ProactivaNet_Mods/issues
// @downloadURL  https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetMods.js
// @updateURL    https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetMods.js
// ==/UserScript==

var scriptActivo = localStorage.getItem("StopContinueBtn");
(function() {
    //console.clear();
    var $ = window.jQuery;


    // Solo para la Lista de incidencias
    if (window.location.href.indexOf("allIncidents") > 0){
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////

const JQ_FILTRO = 'input.pawPTableToolBarSelEdit';
const JQ_FILTRO_ICON = 'button.pawPTableToolBarSelEditBtn';

function ejecutarFiltroFecha() {
    // Si el buscador real no está en este frame, no hacemos nada
    if ($(JQ_FILTRO).length === 0) return;

    const fechaGuardada = GM_getValue("miFecha");
    if (!fechaGuardada) return;

    const [year, month, day] = fechaGuardada.split('-');
    if (!year || !month || !day) return;

    const TEXTO_BUSCAR = `${day}/${month}/${year}`;

    // 1. Escribimos el valor usando jQuery (como te funcionaba al principio)
    $(JQ_FILTRO).val(TEXTO_BUSCAR);
    console.log("Script 1: Aplicando filtro ->", TEXTO_BUSCAR);

    // 2. Hacemos el clic automático con un margen para que procese el texto
    setTimeout(() => {
        if ($(JQ_FILTRO_ICON).length > 0) {
            $(JQ_FILTRO_ICON).trigger("click");
            console.log("Script 1: ¡Clic enviado con jQuery!");
        } else {
            console.warn("Script 1: No se encontró el botón del filtro para hacer clic.");
        }
    }, 300);
}


// Escuchador de Tampermonkey (el que asegura la mensajería entre ambos)
if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener("miFecha", function() {
        console.log("Script 1: Cambio de fecha recibido en este frame.");
        ejecutarFiltroFecha();
    });
}

// Ejecución inicial por si acaso al cargar
ejecutarFiltroFecha();

        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////

     //return;
    }

    'use strict';
    //const JQ_BOTON_MES_SIGUIENTE = 'td.pawCalT1[paw\\:cmd^="nxm"]';
    const JQ_COMBO_TAREAS = 'table#padTypes_id';
    const JQ_TAREA_INTERNA = "#76e5acd7-8e73-43c4-b9f9-f275a8b3f7c6";

    const JQ_CAT_TAREAS = 'div[title^="Tareas internas"]';
    const JQ_COMBO_CAT = 'table#padCategories_id'
    const JQ_AYUDA = 'div.pawFormPageMultiPagePageBar';
    const JQ_TITULO = 'input#incidentTitle.pawDFTexReq';

    const JQ_CAMPOS_OCULTOS = [
        "#fprLocation", "#fprDescription",
        "#fprStatus", "#fprPriority", "#fprCalendar",
        "#fprEstimatedDate", "#fprWorkFlow",
         "#frameIncidentSource"
    ];
    //Campo "notificado por:", agregar arriba para ocultar.
    //"#fprPanUsers_Source",

    scriptActivo = (scriptActivo === "true");
    if (!scriptActivo) return;

    //Array con los id de los campos que se ocultaran
    var OBJ_OCULTOS =[];

    var ALL_READY = false;

    //Contador para ocultar el boton de aceptar (al cargar ya realiza uno)
    var contClick = 0;

    //console.log("Loaded");
    $(document).ready(function(){

        modificarComboTragsa();
        ocultarCamposInnecesarios();
        clonarCombo();

        //setTimeout(() => { $(JQ_COMBO_TAREAS).trigger( "click" ); }, 0);
        $(JQ_COMBO_TAREAS).trigger( "click" );  //Click en el combo primero para cargar las tareas

        //Espera a que esten cargadas las tareas
        const wait_until_tareas = setInterval(() => {
            if ($(JQ_TAREA_INTERNA).length !== 0) {
                $(JQ_TAREA_INTERNA).trigger( "click" );   //Click en tarea
                $(JQ_COMBO_CAT).trigger( "click" );  //Click en el combo para cargar las categorias
                clearInterval(wait_until_tareas);
            }
        }, 0);

        //Espera a que esten cargadas las categorias
        const wait_until_categorias = setInterval(() => {
            if ($(JQ_CAT_TAREAS).length !== 0) {
                $(JQ_CAT_TAREAS).trigger( "click" );  //Click en tareas internas
                setFecha();
                clearInterval(wait_until_categorias);
            }
        }, 0);

        ///Rellena los minutos
        //Deshabilitado temporalmente.
        //const JQ_MINUTOS = 'input#fldPadIncidents_DedicatedHoursFirstLine_M.pawDFInteger';
        //$(JQ_MINUTOS).val(30);

        crearBotonesOpcionales();
        crearBotonesSumarTiempo();
        crearBotonAceptar();

        const wait_until_all_ready = setInterval(() => {
            if (ALL_READY) {
                //console.log( $(JQ_MES_ANTERIOR));
                $(JQ_TITULO).click();
                $(JQ_TITULO).focus();
                $(JQ_TITULO).click();

                //$(JQ_TITULO).trigger( "Click" );   //Click en titulo
                //console.log ($(JQ_TITULO));
                //console.log ("Todas las operaciones finalizadas");
                console.log("Mods cargados ...");
                clearInterval(wait_until_all_ready);
            }
        }, 0);
        //getHoras();


// 🔥 REEMPLAZO SEGURO: Escuchamos el cambio nativo de Tampermonkey en lugar del CustomEvent
if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener("miFecha", function(key, oldValue, newValue, remote) {
        console.log("Script 1 (Ready): Cambio de fecha detectado ->", newValue);

        // Ejecutamos tu setFecha() sacándolo del hilo principal para evitar bloqueos del DOM
        setTimeout(function() {
            if (typeof setFecha === "function") {
                setFecha();
                console.log("Script 1: setFecha() ejecutada con éxito de forma local.");
            } else if (typeof window.setFecha === "function") {
                window.setFecha();
                console.log("Script 1: setFecha() ejecutada con éxito vía window.");
            } else {
                console.error("Script 1: No se puede acceder a setFecha() desde este bloque.");
            }
        }, 50);
    });
}


        console.log("Fin del script.");



    });

    //var autocheck = setTimeout(modificarCombo, 1000);
    //var autocheck = setInterval(modificarCombo, 2000);

    //Busca el mes en texto y lo devuelve en numero
    function getCalendarDate(strMes)
    {
        switch (strMes)
        {
            case "enero": return 1;
            case "febrero": return 2;
            case "marzo": return 3;
            case "abril": return 4;
            case "mayo": return 5;
            case "junio": return 6;
            case "julio": return 7;
            case "agosto": return 8;
            case "septiembre": return 9;
            case "octubre": return 10;
            case "noviembre": return 11;
            case "diciembre": return 12;
        }
        return "0";
    }


    function crearBotonAceptar()
    {
        var strButtonAceptarCaption = "Seleccionar categoria Tragsa y Duración ..."
        var $inputButtonAceptar = $('<input type="button" id="buttonAceptar" value="' + strButtonAceptarCaption + '" />');
        $inputButtonAceptar.width( 600 );
        $inputButtonAceptar.height( 35 );
        $inputButtonAceptar.css("background-color", "red");
        $inputButtonAceptar.css("position", "relative");
        $inputButtonAceptar.css("left", "-300px");

        $inputButtonAceptar.click( function (){
            $inputButtonAceptar.css("display","none");
        });
        var objDestino = $("#pawSvcAuthUsers_idCreatorSign");
        //objDestino.insertBefore($inputButtonAceptar, objDestino.parent.firstChild);
        //$inputButtonAceptar.prependTo(objDestino[0].parentElement);
        $inputButtonAceptar.appendTo(objDestino[0].parentElement);

        //Click en combo trgsa para ocultar
        $("span.pawDFSelPopup").click(function(){
            contClick++;
            if (contClick>1) {
                checkBotonAceptar();
            }
            //console.log("Click");
        });

        $("#fldPadIncidents_DedicatedHoursFirstLine_H").on("input", function() {
            checkBotonAceptar();
        });

        $("#fldPadIncidents_DedicatedHoursFirstLine_M").on("input", function() {
            checkBotonAceptar();
        });
    }

    function checkBotonAceptar()
    {
        var $inputButtonAceptar = $("#buttonAceptar");
        var strButtonAceptarCaption = "Seleccionar categoria Tragsa y Duración ..."
        $inputButtonAceptar.css("display","");
        if ($("#fldPadIncidents_DedicatedHoursFirstLine_H").val() > 0
            || $("#fldPadIncidents_DedicatedHoursFirstLine_M").val() > 0)
        {
            if (contClick>1) $inputButtonAceptar.css("display","none");
            else $inputButtonAceptar.attr('value', 'Seleccionar Categoria');
        }
        else
        {
            if (contClick>1) $inputButtonAceptar.attr('value', 'Seleccionar Duración');
            else $inputButtonAceptar.attr('value', strButtonAceptarCaption);
        }
    }

    //window.setFecha = function()
    function setFecha()
    {
        const JQ_FECHA = 'table#creationDate.pawDFMultiFunReq';
        const JQ_BOTON_MES_ANTERIOR = 'td.pawCalT0[paw\\:cmd^="prm"]';
        const JQ_BOTON_MES_SIGUIENTE = 'td.pawCalT1[paw\\:cmd^="nxm"]';
        const JQ_MES_CALENDARIO = 'td#pawTheLabelTgt.pawCalTc';

        //const ahora = new Date();
        //Sino lo lo hago así lo pone en formato americano.
        const ahora = new Date($(JQ_FECHA).text().split('/').reverse().join('/'));
        //const strHora = "miFecha " + ahora.getHours() + ":" + ahora.getMinutes() + ":" + ahora.getSeconds();


        //const fechaBuscar = new Date(GM_getValue("miFecha") + " " + ahora.getHours() + ":" + ahora.getMinutes() + ":" + ahora.getSeconds());
        const fechaBuscar = new Date(GM_getValue("miFecha"));
        var yearBuscar = fechaBuscar.getFullYear();
        var mesBuscar = (fechaBuscar.getMonth() + 1).toString().padStart(2, "0");
        var dayBuscar = fechaBuscar.getDate().toString().padStart(2, "0");

        const JQ_DIA = '#pawDay_' + yearBuscar + mesBuscar + dayBuscar;

        var difMes = (ahora.getMonth() + (12 * (ahora.getYear()-1))) -( fechaBuscar.getMonth() + (12 * (fechaBuscar.getYear()-1)));


        //console.log ("Fecha seleccionada: " + ahora);
        console.log ("Estableciendo fecha a: " + fechaBuscar);
        //console.log("Diferencia: " + difMes);
        //console.log("Dia Sel: " + JQ_DIA);
        //console.log ("ahora: " + (ahora.getMonth() + (12 * (ahora.getFullYear()-1))));
        //console.log ("ahora: " + (fechaBuscar.getMonth() + (12 * (fechaBuscar.getFullYear()-1))));

        $(JQ_FECHA).trigger( "click" );

        //Espera a que este cargado el calendario
        const wait_until_button_mes_ready = setInterval(() => {
            //console.log (difMes + " - " + $(JQ_MES_CALENDARIO).text());
            var strCalendarText = $(JQ_MES_CALENDARIO).text();
            if ($(JQ_BOTON_MES_ANTERIOR).length !== 0 &&
                $(JQ_MES_CALENDARIO) !== 0 &&
                strCalendarText != "Cargando") {

                //console.log("'" + strCalendarText.split(" ") + "'");

                var numMesSeleccionado = getCalendarDate(strCalendarText.split(" ")[0]);
                var numYearSeleccionado = strCalendarText.split(" ")[2];

                //if (difMes = 0) clearInterval(wait_until_button_mes_ready);
                if (difMes > 0)
                {
                    $(JQ_BOTON_MES_ANTERIOR).trigger( "click" );   //Click en mes anterior
                    difMes--;
                }
                else if (difMes < 0)
                {
                    $(JQ_BOTON_MES_SIGUIENTE).trigger( "click" );   //Click en mes siguiente
                    difMes++;
                }

                //Espera a que este el día visible.
                const wait_until_day_ready = setInterval(() => {
                if ($(JQ_DIA).length !== 0) {
                    //console.log( $(JQ_MES_ANTERIOR));
                    $(JQ_DIA).trigger( "click" );   //Click en el día
                    //$(JQ_DIA).trigger( "mouseout" );   //Click en tarea
                    setTimeout(() => {
                        $(JQ_DIA).trigger( "click" );
                        ALL_READY = true;
                    }, 250);

                    clearInterval(wait_until_day_ready);
                    clearInterval(wait_until_button_mes_ready);
                    console.log ("Dia seleccionado");
                }
                }, 0);
            }
        }, 0);
    }

    function sumarRestarMinutos(minutes)
    {
        const JQ_Min  = "#fldPadIncidents_DedicatedHoursFirstLine_M"
        const JQ_Hour = "#fldPadIncidents_DedicatedHoursFirstLine_H"
        const idCheckBtnRestar = "checkBtnRestar";

        var restar = $("#" + idCheckBtnRestar).is(":checked");

        if ($(JQ_Hour).val() == 0) $(JQ_Hour).val(0);
        if ($(JQ_Min).val() == 0) $(JQ_Min).val(0);

        var hour = parseInt($(JQ_Hour).val());
        var min = parseInt($(JQ_Min).val());

        var totalMinutes = (hour * 60) + min;

        if (restar) //Resta
        {
            totalMinutes = totalMinutes - minutes;
            if (totalMinutes < 0) { totalMinutes = 0; }
        }
        else
        {
            totalMinutes = totalMinutes + minutes;
        }

        var newHour = parseInt(totalMinutes/60);
        var newMinutes = totalMinutes - (60*newHour);

        $(JQ_Min).val(newMinutes);
        $(JQ_Min).trigger('change');
        $(JQ_Hour).val(newHour);
        $(JQ_Hour).trigger('change');

    }

    function crearBotonesSumarTiempo(){

        var idObjOcultar = "fldPadIncidents_OtherExpensesFirstLine";
        const idCheckBtnRestar = "checkBtnRestar";
        const bgColorSumar = "DarkSeaGreen";
        const bgColorRestar = "LightCoral";

        const JQ_Min = "#fldPadIncidents_DedicatedHoursFirstLine_M"
        const JQ_Hour = "#fldPadIncidents_DedicatedHoursFirstLine_H"

        var objOcultar = $("#" + idObjOcultar);
        var objDestino = objOcultar.parent();

        //Oculta el campo de precio euros
        objOcultar[0].style.display = "none";


        //Botones de minutos y horas
        var $inputButton15 = $('<input type="button" value="15\'" />');
        $inputButton15.css("position", "relative");
        $inputButton15.css("left", "20px");
        $inputButton15.css("background-color", bgColorSumar);
        $inputButton15.click( function (){
            sumarRestarMinutos (15);
            checkBotonAceptar();
        });
        $inputButton15.appendTo(objDestino[0]);

        var $inputButton30 = $('<input type="button" value="30\'" />');
        $inputButton30.css("position", "relative");
        $inputButton30.css("left", "30px");
        $inputButton30.css("background-color", bgColorSumar);
        $inputButton30.click( function (){
            sumarRestarMinutos (30);
            checkBotonAceptar();
        });
        $inputButton30.appendTo(objDestino[0]);

        var $inputButton1H = $('<input type="button" value="1H" />');
        $inputButton1H.css("position", "relative");
        $inputButton1H.css("left", "40px");
        $inputButton1H.css("background-color", bgColorSumar);
        $inputButton1H.click( function (){
            sumarRestarMinutos (60);
            checkBotonAceptar();
        });
        $inputButton1H.appendTo(objDestino[0]);

        var $inputButton3H = $('<input type="button" value="3H" />');
        $inputButton3H.css("position", "relative");
        $inputButton3H.css("left", "50px");
        $inputButton3H.css("background-color", bgColorSumar);
        $inputButton3H.click( function (){
            sumarRestarMinutos (180);
            checkBotonAceptar();
        });
        $inputButton3H.appendTo(objDestino[0]);

        //CheckButton Restar
        var $checkBtnRestar = $('<input type="checkbox" value="True"/>');
        $checkBtnRestar.attr({id: idCheckBtnRestar});

        $checkBtnRestar.change( function (){
            var restar = $("#" + idCheckBtnRestar).is(":checked");
            var bgColor = bgColorSumar;
            if (restar) { bgColor = bgColorRestar; }

            $inputButton15.css("background-color", bgColor);
            $inputButton30.css("background-color", bgColor);
            $inputButton1H.css("background-color", bgColor);
            $inputButton3H.css("background-color", bgColor);

        });

        //$checkBtnRestar.css("position", "relative");
        //$checkBtnRestar.css("left", "80px");
        //$checkBtnRestar.appendTo(objDestino[0]);

        var $lblCheckBtnRestar = $("<label>").text('Restar');
        $lblCheckBtnRestar.css("position", "relative");
        $lblCheckBtnRestar.css("left", "65px");
        $lblCheckBtnRestar.appendTo(objDestino[0]);

        //Insert the input into the label
        $checkBtnRestar.appendTo($lblCheckBtnRestar);

    }
    function crearBotonesOpcionales()
    {
        ALL_READY = false;

        var objDestino = $("td.pawFormPageToolBarTd");
        //console.log(objDestino);

        var strButtonCaption = "Establecer Fecha";


        //Boton set fecha
        var $inputButton = $('<input type="button" value="' + strButtonCaption + '" />');
        $inputButton.click( function (){
            setFecha();
        });

        //GM_setValue("miFecha", "2025/07/01");

        /*var $inputFecha = $('<input id="inputFecha" type="text" value="' + GM_getValue("miFecha") + '" />');

        $("<span class='pawTrackerLast'> - Fecha (yyyy/mm/dd): </span>").appendTo(objDestino[0]);
        $inputFecha.width (80);
        $inputFecha.appendTo(objDestino[0]);

        $("#inputFecha").change( function (){
            GM_setValue("miFecha", $inputFecha.val());
            setFecha();
            //console.log(GM_getValue("miFecha"));
            //window.miFecha = $inputFecha;
        });*/
/*
var $inputFecha = $('<input id="inputFecha" type="date" value="' + fechaFormateada + '" />');

$("<span class='pawTrackerLast'> - Fecha: </span>").appendTo(objDestino[0]);
$inputFecha.width(130);
$inputFecha.appendTo(objDestino[0]);

// Evento de cambio para el Input 2
$("#inputFecha").change(function () {
    var nuevoValor = $inputFecha.val(); // "yyyy-mm-dd"

    GM_setValue("miFecha", nuevoValor);

    // 🔄 SINCRONIZAR: Actualizamos el Input 1 (Nativo) si existe en la página
    var input1 = document.getElementById("gmFechaInput");
    if (input1) {
        input1.value = nuevoValor;
    }

    // Ejecutamos tu función de actualización
    if (typeof setFecha === "function") setFecha();
});*/



        //Botones de HOY
        var $inputButtonHoy = $('<input type="button" value="HOY" />');
        $inputButtonHoy.css("position", "relative");
        $inputButtonHoy.css("left", "10px");
        $inputButtonHoy.click( function (){

            var currentDate = new Date();
            var day = ("0" + currentDate.getDate()).slice(-2);
            var month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
            var year = currentDate.getFullYear();

            var formattedDate = year + '/' + month + '/' + day;
            $("#inputFecha").val(formattedDate);
            GM_setValue("miFecha", $inputFecha.val());
            setFecha();
        });
        $inputButtonHoy.appendTo(objDestino[0]);

    }

    function modificarComboTragsa(){

        /*
        const COLOR_1 = "DarkKhaki";
        const COLOR_2 = "Thistle";
        const COLOR_3 = "LightCyan";
        const COLOR_4 = "Bisque";
        const COLOR_5 = "Peru";
        const COLOR_6 = "Chocolate";
        */

        const COLOR_1 = "#EDFCFF";

        const COLOR_2 = "#D2EBC3";
        const COLOR_2_B = "#BDE8A2";

        const COLOR_3 = "#E2E86F";
        const COLOR_3_B = "#E6E8A0";
        const COLOR_3_C = "#D9C148";

        const COLOR_4 = "#C3DBEB";
        const COLOR_4_B = "#A7CCE8";

        const COLOR_5 = "#FFEDED";
        const COLOR_6 = "#FAE3E3";

        var classBuscar = "pawDFSelPopup"
        var elems = window.document.getElementsByTagName("span");
        for (var i in elems){
            var elem = elems[i];
            if (elem != null && elem.className ==classBuscar)
            {
                //paw:ctrl="pawDataFieldSelector"
                //if (elem.getAttribute("paw:ctrl") == "pawDataFieldSelector")
                if (elem.id.indexOf("-" ) > 0)
                {
                //console.log(elem.getAttribute("paw:ctrl"));
                    if (elem.childNodes.length > 15)
                    {
                        //console.log(elem.childNodes.length);
                        for (var x in elem.childNodes)
                        {
                            var elemOpc = elem.childNodes[x];
                            var texto = elemOpc.innerText;

                            if (elemOpc != null && texto != null && texto.indexOf("." ) > 0)
                            {
                                var numero = parseInt(texto.split('.')[0]);
                                var color = "white";
                                var fontWeight = "normal";
                                var fullNumero = texto.substring(1, 5);

                                //object.style.fontWeight = "normal|lighter|bold|bolder|value|initial|inherit"

                                //console.log(numero);

                                switch (numero)
                                {
                                    case 1: color = COLOR_1; break;
                                    case 2:
                                        if (fullNumero == "2.01" || fullNumero == "2.02")
                                        {
                                            fontWeight = "bold";
                                            color = COLOR_2_B;
                                        }
                                        else color = COLOR_2;
                                        break;
                                    case 3:
                                        switch (fullNumero)
                                        {
                                            case "3.01": color = COLOR_3; fontWeight = "bold"; break;
                                            case "3.02": color = COLOR_3_C; fontWeight = "bold"; break;
                                            case "3.03": color = COLOR_3_B; break;
                                            case "3.04": color = COLOR_3_B; fontWeight = "bold"; break;
                                        }
                                        break;
                                    case 4:
                                        color = COLOR_4;
                                        if (fullNumero == "4.03") {
                                            fontWeight = "bold";
                                            color = COLOR_4_B;
                                        }
                                        break;
                                    case 5: color = COLOR_5; break;
                                    case 6: color = COLOR_6; break;
                                }
                                elemOpc.style.background = color;
                                elemOpc.style.fontWeight = fontWeight;
                            }
                        }
                        elem.style.height = '450px';
                        //console.log(elem.id);
                    }
                }
            }
        }
    }

    //Muestra el objeto de ttec en la primera pantalla.
    function clonarCombo()
    {
        console.log("Inicio clonar");

        //var destinationElem = window.document.getElementById("frameClasification");
        var destinationElem = $("#frameClasification");
        //console.log(destinationElem);

        //var objOrig = $("#" + COMBO_ID);

        var objOrig = $('[paw\\:label^="Subcategorías CAU"]').parent().parent().parent().parent();
        //console.log(objOrig);
        var clonedObject = $.extend(true, {}, objOrig);
        $(clonedObject).appendTo($(destinationElem));
    }

    //Oculta los campos que no suelo utilizar.
    function ocultarCamposInnecesarios()
    {
        console.log("Inicio Ocultar Campos");
        var objDestino = $("td.pawFormPageToolBarTd");

        //Oculta los campos normales frm
        //Convierte los selectores jquery en objetos y los agrega a OBJ_OCULTOS
        for (const strJQuerySelector of JQ_CAMPOS_OCULTOS)
        {
            var objOcultar = $(strJQuerySelector);
            OBJ_OCULTOS.push(objOcultar[0]);
            //OBJ_OCULTOS.push(objOcultar.children()[0]);
            //OBJ_OCULTOS.push(objOcultar.children()[1]);
        }

        //Campos mas raros
        var objRaro;
        OBJ_OCULTOS.push($(JQ_AYUDA)[3]);

        OBJ_OCULTOS.push($("td.pawFormPageTableRowLabel[paw\\:rowlabel^='Registrado por']").parents("tr")[0]);
        OBJ_OCULTOS.push($("td.pawFormPageTableHeaderTableTd0:contains('Clasificación TRGS')").parents("tr")[0]);
        OBJ_OCULTOS.push($("td.pawFormPageTableRowLabel:contains('Servicio 1ª línea')").parents("tr")[0]);

        //Ojo, en estos hay unos tr ocultos, por eso el obj[1]
        OBJ_OCULTOS.push($("td.pawFormPageTableRowLabel:contains('Tipo de acci')").parents("tr")[1]);
        OBJ_OCULTOS.push($("td.pawFormPageTableRowLabel:contains('Acción a realizar')").parents("tr")[1]);

        OBJ_OCULTOS.push($("td.pawCFrameThTbTd2:contains('Registro')").parents("tr")[1]);
        OBJ_OCULTOS.push($("td.pawCFrameThTbTd2:contains('Clasificación')").parents("tr")[1]);
        OBJ_OCULTOS.push($("td.pawCFrameThTbTd2:contains('Fin de servicio de primera línea')").parents("tr")[1]);

        //Ocultar campos
        for (const obj of OBJ_OCULTOS) {
            obj.style = "display: none";
            console.log (obj);
        }

        //Creo el boton para mostrarlos de nuevo.
        var $inputButton = $('<input type="button" value="Mostar campos ocultos" />');
        $inputButton.click( function (){
            for (const obj of OBJ_OCULTOS) { obj.style = ""; }
        });

        objDestino[0].append( " ");
        $inputButton.appendTo(objDestino[0]);
    }


})();
