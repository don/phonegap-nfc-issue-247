/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        // Add 3 listeners. Android is going to call the most specific one.

        // Read NDEF formatted NFC Tags
        nfc.addNdefListener (
            function (nfcEvent) {
                var tag = nfcEvent.tag,
                    ndefMessage = tag.ndefMessage;

                // dump the raw json of the message
                // note: real code will need to decode
                // the payload from each record
                var messageAsJSON = JSON.stringify(ndefMessage);
                console.log(messageAsJSON);

                // assuming the first record in the message has
                // a payload that can be converted to a string.
                var payloadAsText = nfc.bytesToString(ndefMessage[0].payload).substring(3);
                console.log(payloadAsText);

                var message = messageAsJSON + '\n\n' + payloadAsText;
                navigator.notification.alert(message, {}, 'Found NDEF tag');
            },
            function () { // success callback
                window.plugins.toast.showShortCenter('Listening for NDEF tags');
            },
            function (error) { // error callback
                alert("Error adding NDEF listener " + JSON.stringify(error));
            }
        );

        // Some devices can't read NDEF from Mifare Classic tag but can still get the tag id
        // These include the Samsung S4 and Nexus 4.
        nfc.addTagDiscoveredListener (
            function (nfcEvent) {
                var tag = nfcEvent.tag;
                navigator.notification.alert(JSON.stringify(tag), {}, 'Found non-NDEF NFC tag');
            },
            function () { // success callback
                console.log('Also listening for non-NDEF tags');
            },
            function (error) { // error callback
                alert('Error adding NDEF listener ' + JSON.stringify(error));
            }
        );

        // look for NFC tags that can be formatted as NDEF
        nfc.addNdefFormatableListener (
            function (nfcEvent) {
                // ignore the incoming event
                // create a new message and write it to the tag
                var ndefMessage = [ ndef.textRecord('Hello') ];
                nfc.write(
                    ndefMessage,
                    function() {
                        window.plugins.toast.showShortCenter('Wrote data to NFC tag');
                    },
                    function() {
                        alert('ERROR: Failed to write message to NFC tag');
                    }
                );
            },
            function () { // success callback
                console.log('Also listening for tags that are NDEF formatable tags');
            },
            function (error) { // error callback
                alert('Error adding NDEF listener ' + JSON.stringify(error));
            }
        );

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
