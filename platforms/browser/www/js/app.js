
var app = {};

app.pages = {

    home: {
        template:
        `
            <div class="app-page" id="page-home">
                <h3>Últimas medições</h3>
                <ul id="lista-medicoes"></ul>
            </div>
        `
    },

    initialize: function(){
        apiConnection.listMedicoes(null, function(result){
            console.log(result);
        });
    }

};


app.pages.show = function(args){
    if (typeof args == 'string')
        args = { page: args };

    var page = app.pages[args.page];
    var html = page.template;
    $('#app-content').html(html);

    if (page.initialize)
        page.initialize();
}
