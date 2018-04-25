
var app = {};

app.pages = {

    home: {
        template:
            '<div class="app-page" id="page-home">'+
                '<div id="new-medicoes"><div id="btn-new-medicoes">Novas medições</div></div>'+
                '<ul id="lista-medicoes" style="display:none"></ul>'+
            '</div>'
        ,
        initialize: function(){

            var item_template = 
                '<li class="item">'+
                    '<div class="title">{{sensor_nome}}</div>'+
                    '<div class="infos">'+
                        '<div class="info info-chuva">{{chuva}}</div>'+
                        '<div class="info info-temp">{{temp}}</div>'+
                    '</div>'+
                    '<div class="time">{{time}}</div>'+
                '</li>'
            ;

            var user = app.currentUser();
            var fcm_token = localStorage.getItem('fcm_token');
            var temp_fcm_token = localStorage.getItem('temp_fcm_token');

            if (temp_fcm_token && (!fcm_token || fcm_token != temp_fcm_token)){
                var device = { user: user.id, uuid:temp_fcm_token };
                apiConnection.saveUserDevice(device, function(response){
                    console.log(response);
                    if (response && response.status == 'ok')
                        localStorage.setItem('fcm_token', temp_fcm_token);
                    else
                        console.log('erro registrando device', response);
                });
            }

            loading(true);
            refreshMedicoes(false, function(){ loading(false); });            

            function refreshMedicoes(increment, cb)
            {
                apiConnection.listMedicoes({userId:user.id}, function(result){
                    var medicoes = result;
                    var html = '';
                    for (var i = 0; i < medicoes.length; i++)
                    {
                        var template = item_template;
                        var medicao = medicoes[i];
                        template = template.replace('{{sensor_nome}}', medicao.nome);
                        template = template.replace('{{chuva}}', medicao.desc_chuva);
                        template = template.replace('{{temp}}', medicao.valor_temperatura + ' ºC');
                        template = template.replace('{{time}}', getFormattedDate(medicao.medicao_date));
                        html += template
                    }

                    if (increment == true)
                        $('#lista-medicoes').append(html);
                    else   
                        $('#lista-medicoes').html(html);
                    
                    if (cb) cb();
                });
            }

            $('#btn-new-medicoes').click(function(){
                $('#main').animate({ scrollTop: 0 }, 250, function(){
                    $('#new-medicoes').removeClass('visible');
                    loading(true);
                    refreshMedicoes(false, function(){ loading(false); });
                });
            });

            var ptr = PullToRefresh.init({
                mainElement: '#page-home',
                onRefresh: function(cb){
                    refreshMedicoes(false, cb);
                },
                distThreshold : 50, // Minimum distance required to trigger the refresh.
                iconArrow: '<span class="fa fa-arrow-down"></span>', // The icon for both instructionsPullToRefresh and instructionsReleaseToRefresh
                instructionsPullToRefresh: "Puxe para atualizar",
                instructionsReleaseToRefresh: "Solte para atualizar",
                instructionsRefreshing: 'Atualizando'
            });

            function loading(load)
            {
                var pnlLoading = $('.pnl-loading');
                var list = $('#lista-medicoes');
                if (load == true){
                    list.fadeOut('fast');
                    pnlLoading.fadeIn('fast');
                }
                else{
                    pnlLoading.fadeOut('fast');
                    list.fadeIn('fast');
                }
            }
        },

        beforeLeave:function(){
            //$(document).off('scroll');
        }
    },

    login:
    {
        template:
        '<div class="app-page" id="page-login">'+
            '<div class="center-div">'+
            '   <div class="form-login pnl-login">'+
            '       <div class="login-logo"></div>'+
            '       <input type="text" id="txt-username" placeholder="Digite seu usuário" />'+
            '       <input type="password" id="txt-pass" placeholder="Digite sua senha" />'+
            '       <div class="login-err">Usuário e/ou senha incorretos</div>'+
            '       <div class="btn-login">Entrar</div>'+
            '   </div>'+
            '   <div class="pnl-login pnl-loading">'+
            '       <div class="loader"></div>'+
            '       <div class="loading-text">Carregando...</div>'+
            '   </div>'+
            '</div>'+
        '</div>',

        initialize:function(){
            // localStorage.removeItem('user');

            var user = app.currentUser();
            if (!user){
                $('.pnl-loading').fadeOut('fast', function(){

                    $('.form-login').fadeIn('fast');
                });
            }else{
                app.pages.show('home');
            }
           
            $('input').on('keyup', function(e)
            {
                if (e && e.which == 13)
                    tryLogin();
            });

            $('.btn-login').click(tryLogin);

            function tryLogin(cb)
            {
                var username = $('#txt-username').val();
                var password = $('#txt-pass').val();

                $('.form-login').fadeOut('fast', function(){
                    $('.pnl-loading').fadeIn('fast');

                    apiConnection.login(username, password, function(userResponse){
                        if (userResponse && userResponse.id > 0){
                            app.currentUser(userResponse);
                            app.pages.show('home');
                        }
                        else{
                            $('.login-err').show();
                            setTimeout(function() { $('.login-err').fadeOut(); }, 5000); 
                            $('#txt-username').val('');
                            $('#txt-pass').val('');
                            $('.pnl-loading').fadeOut('fast', function(){
                                $('.form-login').fadeIn('fast');
                            });
                        }
                    });
                });                
            }
        }
    },

    userConfigs:
    {
        template:''+
        '<div class="app-page" id="page-user-configs">'+
        '   <div class="pnl-loading">'+
        '       <div class="loader"></div>'+
        '   </div>'+
        '   <div class="content">'+
        '       <div class="section"><h2>Notificações</h2>'+
        '           <h3>Chuva</h3>'+
        '           <div class="row">'+
        '               <span>Notificar</span><div class="input-container"><div class="input" data-value="alerta_chuva"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Chovendo</span><div class="input-container"><div class="input" data-value="alerta_chuva_sim"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Sem chuva</span><div class="input-container"><div class="input" data-value="alerta_chuva_nao"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <h3>Temperaturas</h3>'+
        '           <div class="row">'+
        '               <span>Notificar</span><div class="input-container"><div class="input" data-value="alerta_temperatura"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Temperaturas de: </span><div class="temp-input-container"><input id="temp_de" class="temp-range" type="range" min="0" max="40" step="1" /><input class="temp-val" readonly /></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Temperaturas até: </span><div class="temp-input-container"><input id="temp_ate" class="temp-range" type="range" min="0" max="40" step="1"><input class="temp-val" readonly /></div>'+
        '           </div>'+
        '           <div class="btn-save">Salvar Alterações</div>'+
        '       </div>'+
        '   </div>'+
        '</div>',

        initialize:function()
        {
            $('.input').click(function()
            {
                $(this).toggleClass('checked');
                $(this).trigger('change');
            });

            $('.temp-range').on('input', function(){
                var value = $(this).val();
                $(this).parent().find('.temp-val').val(value + " ºC");
            });

            $('.btn-save').click(function()
            {
                var data = getValues();
                loading(true);
                apiConnection.saveUserConfigs(data, function(err, response){
                    if (!err) toast('Alterações salvas com sucesso');
                    app.pages.show('userConfigs');
                });
            });


            let user = app.currentUser() || {};
            let userId = user.id;
            apiConnection.listUserConfigs({ userId:userId },function(result)
            {
                loading(false);
                if (!result) toast('Ocorreu um erro.');
                else showData(result);
            });

            function loading(show)
            {
                var pnlContent = $('.content');
                var pnlLoading = $('.pnl-loading');
                if (show == true)
                {
                    pnlContent.fadeOut('fast');
                    pnlLoading.fadeIn('fast');
                }
                else
                {
                    pnlLoading.fadeOut('fast');
                    pnlContent.fadeIn('fast');
                }
            }

            function showData(data)
            {
                if (data.alerta_chuva == 1)
                    $('.input[data-value="alerta_chuva"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva"').removeClass('checked');

                
                updateRowsVisible('chuva', (data.alerta_chuva == 1));

                if (data.alerta_chuva_sim == 1)
                    $('.input[data-value="alerta_chuva_sim"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva_sim"').removeClass('checked');

                if (data.alerta_chuva_nao == 1)
                    $('.input[data-value="alerta_chuva_nao"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva_nao"').removeClass('checked');

                if (data.alerta_temperatura == 1)
                    $('.input[data-value="alerta_temperatura"').addClass('checked');
                else
                    $('.input[data-value="alerta_temperatura"').removeClass('checked');


                updateRowsVisible('temperatura', (data.alerta_temperatura == 1));

                if (!isNaN(data.alerta_temperatura_de) && data.alerta_temperatura_de != undefined && data.alerta_temperatura_de != null)
                    $('#temp_de').val(data.alerta_temperatura_de);

                if (!isNaN(data.alerta_temperatura_ate) && data.alerta_temperatura_ate != undefined && data.alerta_temperatura_ate != null)
                    $('#temp_ate').val(data.alerta_temperatura_ate);

                $('#temp_de').trigger('input');
                $('#temp_ate').trigger('input');

            }

            function getValues()
            {
                var data = {};

                data.alertaChuva = $('.input[data-value="alerta_chuva"').hasClass('checked') ? 1 : 0;
                data.alertaChuvaSim = $('.input[data-value="alerta_chuva_sim"').hasClass('checked') ? 1 : 0;
                data.alertaChuvaNao = $('.input[data-value="alerta_chuva_nao"').hasClass('checked') ? 1 : 0;
                data.alertaTemperatura = $('.input[data-value="alerta_temperatura"').hasClass('checked') ? 1 : 0;
                data.alertaTemperaturaDe = $('#temp_de').val() * 1;
                data.alertaTemperaturaAte = $('#temp_ate').val() * 1;
                data.userId = userId;

                return data;
            }

            function updateRowsVisible(type, visible) {
                if (type == 'chuva'){
                    if (visible) {
                        $('.input[data-value="alerta_chuva_sim"]').closest('.row').show();
                        $('.input[data-value="alerta_chuva_nao"]').closest('.row').show();
                    }
                    else {
                        $('.input[data-value="alerta_chuva_sim"]').closest('.row').hide();
                        $('.input[data-value="alerta_chuva_nao"]').closest('.row').hide();
                    }
                }
                else if (type == 'temperatura') {
                    if (visible) {
                        $('#temp_de').closest('.row').show();
                        $('#temp_ate').closest('.row').show();
                    }
                    else{
                        $('#temp_de').closest('.row').hide();
                        $('#temp_ate').closest('.row').hide();
                    }
                }

            }

            $('.input[data-value="alerta_chuva"]').on('change', function(e) {
                var checked = $(this).hasClass("checked");
                updateRowsVisible('chuva', checked);
            });

            $('.input[data-value="alerta_temperatura"]').on('change', function(e) {
                var checked = $(this).hasClass("checked");
                updateRowsVisible('temperatura', checked);
            });

            $('.input[data-value="alerta_chuva"]').on('change', function(e) {
                var checked = $(this).hasClass("checked");
                if (checked){
                    $('.input[data-value="alerta_chuva_sim"]').closest('.row').show();
                    $('.input[data-value="alerta_chuva_nao"]').closest('.row').show();
                } else {
                    $('.input[data-value="alerta_chuva_sim"]').closest('.row').hide();
                    $('.input[data-value="alerta_chuva_nao"]').closest('.row').hide();
                }
            });
        }
    }
    
};

app.currentUser = function(value){

    if (value == undefined)
        return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : localStorage.getItem('user');

    localStorage.setItem('user', JSON.stringify(value));
}

app.logout = function(){
    localStorage.removeItem('user');
    localStorage.removeItem('fcm_token');
    app.pages.show('login');
}

app.pages.currentPage = null;

app.pages.show = function(args){
    if (typeof args == 'string')
        args = { page: args };

    var page = app.pages[args.page];
    var html = page.template;

    if (app.pages.currentPage){
        var currentPage = app.pages[app.pages.currentPage];
        if (currentPage && currentPage.beforeLeave)
            currentPage.beforeLeave();
    }

    $('#app-content').fadeOut('fast', function(){
        $('#app-content').html(html);
        if (args.page == 'login') $('#app-header').hide();
        else $('#app-header').show();

        $('#app-content').fadeIn('fast');
        
        if (page.initialize)
            page.initialize();

        app.pages.currentPage = args.page;
    });
}



function stringToDate(str)
{
	if(!str) return null;

    var date = [1970,0,1,0,0,0,0];

    var dateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})( (\d{2}):(\d{2})(:(\d{2})(.(\d{3}))?)?)?$/;
    var dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    var timeRegex = /^(\d{2}):(\d{2})(:(\d{2})(.(\d{3}))?)?$/;

    var d = dateRegex.exec(str);
    if(d)
    {
        var ymd = [1970,0,1];
        if(d.length > 1 && d[1]) date[0] = parseInt(d[1]);
        if(d.length > 2 && d[2]) date[1] = parseInt(d[2] - 1);
        if(d.length > 3 && d[3]) date[2] = parseInt(d[3]);
        date = new Date(date[0], date[1], date[2]);
    }
    else
    {
        var dt = dateTimeRegex.exec(str);
        if(dt)
        {
            // [1,2,3] | [5,6,8,10]
            if(dt.length > 1 && dt[1]) date[0] = parseInt(dt[1]);
            if(dt.length > 2 && dt[2]) date[1] = parseInt(dt[2] - 1);
            if(dt.length > 3 && dt[3]) date[2] = parseInt(dt[3]);
            if(dt.length > 5 && dt[5]) date[3] = parseInt(dt[5]);
            if(dt.length > 6 && dt[6]) date[4] = parseInt(dt[6]);
            if(dt.length > 8 && dt[8]) date[5] = parseInt(dt[8]);
            if(dt.length > 10 && dt[10]) date[6] = parseInt(dt[10]);
            date = new Date(date[0], date[1], date[2], date[3], date[4], date[5], date[6]);
        }
        else
        {
            var t = timeRegex.exec(str);
            if(t)
            {
                //[1,2,4,6]
                if(t.length > 1 && t[1]) date[3] = parseInt(t[1]);
                if(t.length > 2 && t[2]) date[4] = parseInt(t[2]);
                if(t.length > 4 && t[4]) date[5] = parseInt(t[4]);
                if(t.length > 6 && t[6]) date[6] = parseInt(t[6]);
                date = new Date(date[0], date[1], date[2], date[3], date[4], date[5], date[6]);
            }
        }
    }
    return date;
}

function dateToString(date, format)
{
    if(typeof date == 'string') date = stringToDate(date);
    if(!date || !(date instanceof Date)) return null;

    if(!format) format = 'yyyy-MM-dd HH:mm:ss.fff';
    function f(value, length) { value = value.toString(); while(value.length < length) value = '0'+value; return value; }

    var yyyy = f(date.getFullYear(),4);
    var YY = yyyy.substring(2);
    var MM = f(date.getMonth() + 1,2);
    var dd = f(date.getDate(),2);
    var HH = f(date.getHours(),2);
    var mm = f(date.getMinutes(),2);
    var ss = f(date.getSeconds(),2);
    var fff = f(date.getMilliseconds(),3);

    return format.replace('yyyy', yyyy).replace('YY',YY).replace('MM',MM).replace('dd',dd).replace('HH',HH).replace('mm',mm).replace('ss',ss).replace('fff', fff);
}

function getFormattedDate(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
    var year = date.getFullYear(),
        month = date.getMonth()+1,
        day = date.getDate();

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31){
        return (
            ((day<10) ? '0'+day.toString() : day.toString())+'/'+
            ((month<10) ? '0'+month.toString() : month.toString()) + '/'+
            year.toString()
        );
    }
        

    var r =
    ( 
        (
            day_diff == 0 && 
            (
                (diff < 60 && "agora")
                || (diff < 120 && "1 minuto atrás")
                || (diff < 3600 && Math.floor(diff / 60) + " minutos atrás")
                || (diff < 7200 && "1 hora atrás")
                || (diff < 86400 && Math.floor(diff / 3600) + " horas atrás")
            )
        )
        || (day_diff == 1 && "Ontem")
        || (day_diff < 7 && day_diff + " d")
        || (day_diff < 31 && Math.ceil(day_diff / 7) + " sem")
    );

    return r;
}