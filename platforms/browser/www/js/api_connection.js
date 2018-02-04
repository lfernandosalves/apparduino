var apiConnection = 
{

    apiUrl: 'http://localhost:5000',

    get: function(args, cb){
        if (!args) return null;

        if (typeof args == 'string'){
            args = { url: args };
        }

        console.log('GET ' + args.url);
        $.ajax({
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

    listMedicoes: function(args, cb){
        apiConnection.get(apiUrl + '/api/medicoes/list', cb);
    }


};