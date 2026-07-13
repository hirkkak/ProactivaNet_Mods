// ==UserScript==
// @name     ProActivaNet Mario Helper
// @namespace    ProactivaNet
// @version      2026-07-13
// @author       Hirkkak
// @description  Helper para activar las customizaciones de proActivaNet
// @match        */proactivanet/servicedesk/incidents/formIncidents/formIncidents.paw*
// @match        */proactivanet/servicedesk/incidents/allIncidents/allIncidents.paw*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
//
// @supportURL   https://github.com/hirkkak/ProactivaNet_Mods/issues
// @downloadURL  https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetModsHelper.js
// @updateURL    https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetModsHelper.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
// ==/UserScript==

//http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js

//const MODIFICACIONES_ACTIVADAS = "StopContinueBtn";

(function() {
    //'use strict';
    //console.clear();
    console.log("Inicio Helper");
    var $ = window.jQuery;


    // Pantalla todas las incidencias
    //if (window.location.href.indexOf("formIncidents") > 0){
        console.log("Modo Incidencia");

        //Resalta el boton + para no confundirse en pantalla dividida.
        var btnAddNew = $("#pageAddNewBtn");
        btnAddNew.css ("background", "lightgreen");
        btnAddNew.css('border', '3px solid black');
        btnAddNew.css('border-radius', '25px');
        btnAddNew.css('padding-top', '3px');

        //--- Add the button.
        $("body").append (
            '<div class="gmPersistentButton" style="position: absolute; right: 1.0px; top: 1.0px;"><button id="gmContinueBtn">Init failed!</button></div>'
        );

        //--- The matching control object:
        var btnControl = new PersistentButton (
            "gmContinueBtn", //-- HTML id
            "StopContinueBtn", //-- Storage label
            ["Modificaciones detenidas :(", "Modificaciones activadas"], //-- Text that the button cycles through
            [false, true] //-- Matching values for the button's states
        );

        //--- Activate the button.
        $("#gmContinueBtn").click ( function () {
            var btnValue = this.value;
            var keepgoing = btnValue;
            btnControl.SetNextValue ();
        } );

    ////////////////////////////////////////////////////////////////////////////////////////


// 2. Insertar el input de fecha
var botonElemento = document.getElementById("gmContinueBtn");

if (botonElemento) {
    var fechaInput = document.createElement("input");
    fechaInput.type = "date";
    fechaInput.id = "gmFechaInput";
    fechaInput.style.marginRight = "10px";
    fechaInput.style.padding = "4px";

    // Leer valor inicial
    var fechaGuardada = GM_getValue("miFecha") || "";
    if (fechaGuardada) {
        fechaInput.value = fechaGuardada.replace(/\//g, "-");
    } else {
        fechaInput.value = new Date().toISOString().split('T')[0];
        GM_setValue("miFecha", fechaInput.value);
    }

    // Al cambiar de forma manual en la pantalla, guardamos en Tampermonkey
    fechaInput.addEventListener("change", function() {
        GM_setValue("miFecha", this.value);
    });

// Escuchador nativo (el que ya te funciona para hablarse)
if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener("miFecha", function(key, oldValue, newValue, remote) {

        // 🔄 1. SINCRO VISUAL: Si el cambio viene del OTRO script, pintamos la nueva fecha en este input
        var inputLocal = document.getElementById("gmFechaInput");
        if (inputLocal && remote) {
            inputLocal.value = newValue;
            console.log("Helper: Input visual sincronizado con éxito ->", newValue);
        }

        // 2. Si el cambio lo ha provocado este mismo script de forma local,
        // pasamos olímpicamente para evitar que se pise a sí mismo en los eventos.
        if (!remote) return;

        console.log("Helper: Cambio externo detectado, ejecutando acciones...");

        // 3. Ejecutamos el filtro primero
        ejecutarFiltroFecha();

        // 4. Sacamos setFecha() del evento para que no se bloquee si modifica algo
        setTimeout(function() {
            if (typeof setFecha === "function") {
                setFecha();
                console.log("Helper: setFecha() ejecutada de forma independiente.");
            }
        }, 0);
    });
}


    botonElemento.parentNode.insertBefore(fechaInput, botonElemento);
}

    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////


        //--- The button will fade when we aren't using it.
        var zDisplayPanel = $('div.gmPersistentButton');
        zDisplayPanel.hover (
            function () { $(this).stop (true, false).fadeTo (50, 1); },
            function () { $(this).stop (true, false).fadeTo (900, 0.1); }
        );
        zDisplayPanel.fadeTo (2900, 0.1);
    /*}
    else if (window.location.href.indexOf("allIncidents") > 0){
        return;
        console.log("Modo Lista Incidencias");
    }*/


    //--- Button object
    function PersistentButton (htmlID, setValName, textArry, valueArry) {
        //--- Initialize the button to last stored value or default.
        var buttonValue = valueArry[0];
        fetchValue ();
        storeValue (); //-- Store, in case it wasn't already.
        setButtonTextAndVal ();

        //--- DONE with init.  Set click and keyboard listeners externally.

        //***** Public functions:
        this.Reset = function () {
            buttonValue = valueArry[0];
            storeValue ();
            setButtonTextAndVal ();
        };

        this.SetNextValue = function () {
            var numValues = valueArry.length;
            var valIndex = 0;

            for (var J = numValues - 1; J >= 0; --J) {
                if (buttonValue == valueArry[J]) {
                    valIndex = J;
                    break;
                }
            }
            valIndex++;
            if (valIndex >= numValues) valIndex = 0;

            buttonValue = valueArry[valIndex];

            storeValue ();
            setButtonTextAndVal ();
            window.location.href = window.location.href
        };


        //***** Private functions:
        function fetchValue () {
            buttonValue = localStorage.getItem(setValName, buttonValue);

            //No pillaba bien los booleanos
            buttonValue = (buttonValue === "true");
            if (buttonValue) $("#gmContinueBtn").css ("background", "lime");
            else $("#gmContinueBtn").css ("background", "orange");
            //console.log("GET: " + setValName + " - Valor:" + buttonValue);

        }

        function storeValue () {
            localStorage.setItem(setValName, buttonValue);
            if (buttonValue) $("#gmContinueBtn").css ("background", "lime");
            else $("#gmContinueBtn").css ("background", "orange");
            //console.log("SET: " + setValName + " - Valor:" + buttonValue);
            //console.log("REAL_GET: " + localStorage.getItem(setValName));

        }

        function setButtonTextAndVal () {
            var buttonText = "*ERROR!*";
            for (var J = valueArry.length - 1; J >= 0; --J) {
                if (buttonValue == valueArry[J]) {
                    buttonText = textArry[J];
                    break;
                }
            }

            var theBtn = document.getElementById (htmlID);
            if (theBtn) {
                theBtn.textContent = buttonText;
                theBtn.setAttribute ("value", buttonValue);
            }
            else alert ('Missing persistent button with ID: ' + htmlID + '!');
        }
    }
})();
