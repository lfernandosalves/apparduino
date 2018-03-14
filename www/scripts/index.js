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
var phonegap_app = {
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
        phonegap_app.receivedEvent('deviceready');
        document.addEventListener("backbutton", onBackClick, true);
        initializeApp();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


function initializeApp(){
    app.pages.show('login');

    $('.btn-open-menu').click(function(e){
        e.stopPropagation();
        $('#app-menu').removeClass('hidden');
    });

    $('#main').click(function(){ $('#app-menu').addClass('hidden'); });

    $('#app-menu').find('.menu-itens').find('li').click(function(e){
        //e.stopPropagation();
        var action = $(this).data('page');

        if (action == 'logout') app.logout();
        else app.pages.show(action);
    });


    // const push = PushNotification.init({
    //     android: {
    //     },
    //     browser: {
    //         pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    //     },
    //     ios: {
    //         alert: "true",
    //         badge: "true",
    //         sound: "true"
    //     },
    //     windows: {}
    // });
    
    // push.on('registration', (data) => {
    //     // data.registrationId
    //     console.log('registration');
    //     console.log(data);
    // });
    
    // push.on('notification', (data) => {
    //     // data.message,
    //     // data.title,
    //     // data.count,
    //     // data.sound,
    //     // data.image,
    //     // data.additionalData
    // });
    
    // push.on('error', (e) => {
    //     // e.message
    // });



    // window.FirebasePlugin.getToken(function(token) {
    //     //save this server-side and use it to push notifications to this device
    //     console.log('firebase');
    //     console.log(token);
    // }, function(error) {
    //     console.error(error);
    // });

    // window.FirebasePlugin.onTokenRefresh(function(token) {
    //     //save this server-side and use it to push notifications to this device
    //     console.log('refresh');
    //     console.log(token);
    // }, function(error) {
    //     console.error(error);
    // });

    // window.FirebasePlugin.hasPermission(function(data){
    //     console.log(data.isEnabled);
    // });

    //FCMPlugin.onTokenRefresh( onTokenRefreshCallback(token) );
    //Note that this callback will be fired everytime a new token is generated, including the first time.
    
    console.log(FCMPlugin);
    FCMPlugin.onTokenRefresh(function(token){
        console.log('token');
        alert(token);
    });

    //FCMPlugin.getToken( successCallback(token), errorCallback(err) );
    //Keep in mind the function will return null if the token has not been established yet.
    FCMPlugin.getToken(function(token){
        alert(token);
    });

    //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
    //Here you define your application behaviour based on the notification data.
    FCMPlugin.onNotification(function(data){
    if(data.wasTapped){
      //Notification was received on device tray and tapped by the user.
      alert(JSON.stringify(data));
    }else{
      //Notification was received in foreground. Maybe the user needs to be notified.
      alert(JSON.stringify(data));
    }
});

}


function toast(message, callback)
{
    window.plugins.toast.showLongCenter(message, function(res){ 
        if (callback) callback(res); 
    }, function(err){ if (callback) callback(err); })
}

function onBackClick()
{
    if (app.pages.currentPage == 'userConfigs')
        app.pages.show('home')
    else
        navigator.app.exitApp();
}



