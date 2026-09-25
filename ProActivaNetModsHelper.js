// ==UserScript==
// @name     ProActivaNet Mario Helper
// @namespace    ProactivaNet
// @version      2026-09-25
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

// 📅 LISTA DE FESTIVOS (Formato: "MM-DD")
// Añade o quita los días que necesites festivos en tu localidad
var ARRAY_FESTIVOS = [
    "01-01", // Año Nuevo
    "01-06", // Reyes
    "01-29", // San Valero
    "04-23", // San Jorge
    "05-01", // Día del Trabajo
    "08-15", // Asunción
    "10-12", // El pilar
    "11-01", // Todos los Santos
    "12-06", // Constitución
    "12-08", // Inmaculada
    "12-24", // Nochebuena
    "12-25", // Navidad
    "12-31"  // Nochevieja
];

// 🌉 Array que guardará los puentes generados dinámicamente ("MM-DD")
var ARRAY_PUENTES = [];


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

        // Creamos el label para el día de la semana
        var diaSemanaLabel = document.createElement("span");
        diaSemanaLabel.id = "gmDiaSemanaLabel";
        diaSemanaLabel.style.marginRight = "10px";
        //diaSemanaLabel.style.fontWeight = "bold";
        diaSemanaLabel.style.fontSize = "14px";

        // 🚀 Función que se ejecuta una sola vez al iniciar para buscar puentes
        function generarPuentesDelAño() {
            var añoActual = new Date().getFullYear();
            ARRAY_PUENTES = []; // Limpiar array

            ARRAY_FESTIVOS.forEach(function(festivo) {
                // Creamos el objeto fecha para cada festivo en el año actual usando barras
                var fechaFestivo = new Date(añoActual + "/" + festivo.replace("-", "/"));
                var diaSemana = fechaFestivo.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb

                if (diaSemana === 2) {
                    // Si el festivo es Martes, el Lunes anterior es puente
                    var lunesPuente = new Date(fechaFestivo);
                    lunesPuente.setDate(fechaFestivo.getDate() - 1);

                    var mesLunes = String(lunesPuente.getMonth() + 1).padStart(2, '0');
                    var diaLunes = String(lunesPuente.getDate()).padStart(2, '0');
                    ARRAY_PUENTES.push(mesLunes + "-" + diaLunes);
                }
                else if (diaSemana === 4) {
                    // Si el festivo es Jueves, el Viernes posterior es puente
                    var viernesPuente = new Date(fechaFestivo);
                    viernesPuente.setDate(fechaFestivo.getDate() + 1);

                    var mesViernes = String(viernesPuente.getMonth() + 1).padStart(2, '0');
                    var diaViernes = String(viernesPuente.getDate()).padStart(2, '0');
                    ARRAY_PUENTES.push(mesViernes + "-" + diaViernes);
                }
            });
            console.log("Helper - Puentes detectados para este año:", ARRAY_PUENTES);
        }

        // Ejecutamos la búsqueda de puentes inmediatamente al arrancar
        generarPuentesDelAño();

        // Función auxiliar para calcular y pintar el día abreviado (ej: "lun")
        function actualizarLabelDia(fechaStr) {
            if (!fechaStr) { diaSemanaLabel.textContent = ""; return; }

            // Forzamos la interpretación local de la fecha sustituyendo guiones por barras
            var fechaObj = new Date(fechaStr.replace(/-/g, "/"));
            //var diaAbreviado = fechaObj.toLocaleDateString('es-ES', { weekday: 'short' });
            //diaSemanaLabel.textContent = "(" + diaAbreviado.replace('.', '') + ")";
            var diaNoAbreviado = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' });
            diaSemanaLabel.textContent = "(" + diaNoAbreviado.replace('.', '') + ")";

            // 1. Comprobar si es FIN DE SEMANA (6 = Sábado, 0 = Domingo)
            var numeroDiaSemana = fechaObj.getDay();
            var esFinde = (numeroDiaSemana === 6 || numeroDiaSemana === 0);

            // 2. Comprobar si es FESTIVO o PUENTE (usando el "MM-DD")
            var mesDia = fechaStr.substring(5, 10);
            var esFestivo = ARRAY_FESTIVOS.includes(mesDia);
            var esPuente = ARRAY_PUENTES.includes(mesDia);

            // 🔴 Si cumple cualquiera, se pinta en rojo
            if (esFinde || esFestivo || esPuente) {
                diaSemanaLabel.style.color = "red";
                if (esPuente) { diaSemanaLabel.textContent = "Puente 🌉 - " + diaSemanaLabel.textContent; }
            } else {
                diaSemanaLabel.style.color = "";
            }

        }

        // Leer valor inicial
        var fechaGuardada = GM_getValue("miFecha") || "";
        if (fechaGuardada) {
            fechaInput.value = fechaGuardada.replace(/\//g, "-");
        } else {
            fechaInput.value = new Date().toISOString().split('T')[0];
            GM_setValue("miFecha", fechaInput.value);
        }

        // Pintamos el día de la semana nada más cargar
        actualizarLabelDia(fechaInput.value);

        // Al cambiar de forma manual en la pantalla, guardamos en Tampermonkey
        fechaInput.addEventListener("change", function() {
            GM_setValue("miFecha", this.value);
            actualizarLabelDia(this.value);
        });

        // Inyectamos los dos elementos antes del botón
        botonElemento.parentNode.insertBefore(fechaInput, botonElemento);
        botonElemento.parentNode.insertBefore(diaSemanaLabel, botonElemento);

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
