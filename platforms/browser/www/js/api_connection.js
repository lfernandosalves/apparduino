var apiConnection = 
{

    apiUrl: 'http://localhost:5000',
    //apiUrl:'http://arduinosensort-com.umbler.net',

    get: function(args, cb){
        if (!args) return null;

        if (typeof args == 'string'){
            args = { url: args };
        }

        console.log('GET ' + args.url);
        $.ajax({
            type:'GET',
            url:args.url,
            success:function(res){
                if (cb) cb(res);
            },
            error: function(err){
                console.error(err);
                if (cb) cb(err);
            }
        });
    },

    post: function(args, data, cb){
        if (!args) return null;

        if (typeof args == 'string'){
            args = { url: args };
        }

        console.log('POST ' + args.url, data);
        $.post(args.url, data, cb);
    },

    login: function(username, password, cb){
        var url = apiConnection.apiUrl + '/api/users/login';
        apiConnection.post(url, { username:username, password:password }, cb);
    },

    listMedicoes: function(args, cb){
        var url = apiConnection.apiUrl + '/api/medicoes/list';
        if (args.userId) url += '?user=' + args.userId;
        apiConnection.get(url, cb);
    }
};