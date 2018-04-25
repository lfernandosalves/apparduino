
var phonegap_app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        phonegap_app.receivedEvent('deviceready');
        document.addEventListener("backbutton", onBackClick, true);
        initializeApp();
    },

    receivedEvent: function(id) {
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

    FCMPlugin.onTokenRefresh(function(token){
        console.log('set temp', token);
        localStorage.setItem('temp_fcm_token', token);
        alert('DEVICE -> ' + token);
    });

    FCMPlugin.getToken(function(token){
        //alert(token);
        console.log('set temp' + token);
        localStorage.setItem('temp_fcm_token', token);
    });

    //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
    //Here you define your application behaviour based on the notification data.
    FCMPlugin.onNotification(function(data){
        if(data.wasTapped){
        //Notification was received on device tray and tapped by the user.
            
            alert('Nova medição recebida (WAS TAPPED)');
            alert(JSON.stringify(data));
        }else{
        //Notification was received in foreground. Maybe the user needs to be notified.
            
            alert('Nova medição recebida (WAS NOT TAPPED)');
            alert(JSON.stringify(data));
        }
    });

    FCMPlugin.onNotificationReceived(function(data){
        alert('onNotificationReceived!');
        
        if(data.wasTapped){
        //Notification was received on device tray and tapped by the user.
            
            alert('Nova medição recebida (WAS TAPPED)');
            alert(JSON.stringify(data));
        }else{
        //Notification was received in foreground. Maybe the user needs to be notified.
            
            alert('Nova medição recebida (WAS NOT TAPPED)');
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



