
var app = {};

app.pages = {

    home: {
        template:
            '<div class="app-page" id="page-home">'+
                '<ul id="lista-medicoes"></ul>'+
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

                $('#lista-medicoes').html(html);
            });
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
           
            $('.btn-login').click(function(){
                $('.form-login').fadeOut('fast', function(){
                    $('.pnl-loading').fadeIn('fast');

                    tryLogin(function(success){
                        if (!success){
                            $('.login-err').show();
                            setTimeout(function() { $('.login-err').fadeOut(); }, 5000); 
                            $('#txt-username').val('');
                            $('#txt-pass').val('');
                            $('.pnl-loading').fadeOut('fast', function(){
                                $('.form-login').fadeIn('fast');
                            });
                        }
                        else
                            app.pages.show('home');
                    });
                });
            });

            function tryLogin(cb){
                var username = $('#txt-username').val();
                var password = $('#txt-pass').val();

                if (!username || username == '' || !password || password == ''){
                    cb(false);
                    return;
                }

                apiConnection.login(username, password, function(userResponse){
                    if (userResponse && userResponse.id > 0){
                        app.currentUser(userResponse);
                        cb(true);
                    }
                    else
                        cb(false);
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
        '           <div class="row">'+
        '               <span>Muita chuva</span><div class="input-container"><div class="input" data-value="alerta_chuva_1"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Chuva moderada</span><div class="input-container"><div class="input" data-value="alerta_chuva_2"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Pouca chuva</span><div class="input-container"><div class="input" data-value="alerta_chuva_3"><div class="selector"></div></div></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Temperaturas abaixo de: </span><div class="temp-input-container"><input id="temp_abaixo" class="temp-range" type="range" min="0" max="40" step="1" /><input class="temp-val" readonly /></div>'+
        '           </div>'+
        '           <div class="row">'+
        '               <span>Temperaturas acima de: </span><div class="temp-input-container"><input id="temp_acima" class="temp-range" type="range" min="0" max="40" step="1"><input class="temp-val" readonly /></div>'+
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
                    app.pages.show('userConfigs');
                });
            });


            let user = app.currentUser() || {};
            let userId = user.id;
            apiConnection.listUserConfigs({ userId:userId },function(result)
            {
                loading(false);
                if (!result) alert('Ocorreu um erro.');
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
                if (data.alerta_chuva_1 == 1)
                    $('.input[data-value="alerta_chuva_1"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva_1"').removeClass('checked');

                if (data.alerta_chuva_2 == 1)
                    $('.input[data-value="alerta_chuva_2"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva_2"').removeClass('checked');

                if (data.alerta_chuva_3 == 1)
                    $('.input[data-value="alerta_chuva_3"').addClass('checked');
                else
                    $('.input[data-value="alerta_chuva_3"').removeClass('checked');

                if (!isNaN(data.alerta_temperatura_abaixo) && data.alerta_temperatura_abaixo != undefined && data.alerta_temperatura_abaixo != null)
                    $('#temp_abaixo').val(data.alerta_temperatura_abaixo);

                if (!isNaN(data.alerta_temperatura_acima) && data.alerta_temperatura_acima != undefined && data.alerta_temperatura_acima != null)
                    $('#temp_acima').val(data.alerta_temperatura_acima);

                $('#temp_abaixo').trigger('input');
                $('#temp_acima').trigger('input');

                console.log(data);
            }

            function getValues()
            {
                var data = {};

                data.alertaChuva1 = $('.input[data-value="alerta_chuva_1"').hasClass('checked') ? 1 : 0;
                data.alertaChuva2 = $('.input[data-value="alerta_chuva_2"').hasClass('checked') ? 1 : 0;
                data.alertaChuva3 = $('.input[data-value="alerta_chuva_3"').hasClass('checked') ? 1 : 0;
                data.alertaTempAcima = $('#temp_acima').val() * 1;
                data.alertaTempAbaixo = $('#temp_abaixo').val() * 1;
                data.userId = userId;

                return data;
            }
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
    app.pages.show('login');
}

app.pages.show = function(args){
    if (typeof args == 'string')
        args = { page: args };

    var page = app.pages[args.page];
    var html = page.template;

    $('#app-content').fadeOut('fast', function(){
        $('#app-content').html(html);
        if (args.page == 'login') $('#app-header').hide();
        else $('#app-header').show();

        $('#app-content').fadeIn('fast');
        
        if (page.initialize)
            page.initialize();
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

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
        return (
            year.toString()+'-'
            +((month<10) ? '0'+month.toString() : month.toString())+'-'
            +((day<10) ? '0'+day.toString() : day.toString())
        );

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