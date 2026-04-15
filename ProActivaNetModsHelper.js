// ==UserScript==
// @name     ProActivaNet Mario Helper
// @namespace    ProactivaNet
// @version      2026-04-15a
// @author       Hirkkak
// @description  Helper para activar las customizaciones de proActivaNet
// @match        */proactivanet/servicedesk/incidents/formIncidents/formIncidents.paw
// @require      https://code.jquery.com/jquery-3.6.0.min.js
//
// @supportURL   https://github.com/hirkkak/ProactivaNet_Mods/issues
// @downloadURL  https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetModsHelper.js
// @updateURL    https://github.com/hirkkak/ProactivaNet_Mods/raw/main/ProActivaNetModsHelper.js
// ==/UserScript==

//http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js

//const MODIFICACIONES_ACTIVADAS = "StopContinueBtn";

(function() {
    //'use strict';
    //console.clear();

    var $ = window.jQuery;

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

        /*if (keepgoing == "true") {
            // CALL YOUR FUNCTION HERE.
            //$("h1").css ("background", "lime"); //just for fun.
            //$(".gmPersistentButton").css ("background", "lime"); //just for fun.
            $("#gmContinueBtn").css ("background", "lime"); //just for fun.

        }
        else {
            //$("h1").css ("background", "pink"); //just for fun.
            $("#gmContinueBtn").css ("background", "pink"); //just for fun.
        }*/
    } );


    //--- The button will fade when we aren't using it.
    var zDisplayPanel = $('div.gmPersistentButton');
    zDisplayPanel.hover (
        function () { $(this).stop (true, false).fadeTo (50, 1); },
        function () { $(this).stop (true, false).fadeTo (900, 0.1); }
    );
    zDisplayPanel.fadeTo (2900, 0.1);
    //zDisplayPanel.fadeTo (0, 800);


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
