/*!
 * Geochange plugin script
 * Muda os valores de um selectbox ao mudar o valor de outro
 */ 
;(function ( $, window, document, undefined ) {

    // 'undefined' é usado aqui como a variável global 'undefined', no ECMAScript 3 é
    // mutável (ou seja, pode ser alterada por alguém). 'undefined' não está sendo
    // passado na verdade, assim podemos assegurar que o valor é realmente indefinido.
    // No ES5, 'undefined' não pode mais ser modificado.

    // 'window' e 'document' são passados como variáveis locais ao invés de globais,
    // assim aceleramos (ligeiramente) o processo de resolução e pode ser mais eficiente
    // quando minificado (especialmente quando ambos estão referenciados corretamente).

    // Cria as propriedades padrão
    var pluginName = "GeoChange",
        defaults = {
            // Plugin settings
            session_id: '',
            webroot: '',
            joined: false, // Define se filtra a busca ou se retorna todos os dados disponíveis
            hasClass_chzn: false,
            debug: false,
            // Alvos para executar a mudanca de dados
            ContinenteId: '',
            PaisId: '',
            EstadoId: '',
            CidadeId: '',

            // Urls dos alvos
            PaisUrl: 'geo/paises/',
            EstadoUrl: 'geo/estados/',
            CidadeUrl: 'geo/cidades/',

            // Mensagens a exibir quando busca pelos dados
            LoadingMessage: 'Carregando...',
            PaisLoadingMessage: 'Selecione o País',
            EstadoLoadingMessage: 'Selecione o Estado',
            CidadeLoadingMessage: 'Escolha um país e um estado'
        };

    // O verdadeiro construtor do plugin
    function Plugin( element, options ) {
        this.element = element;

        // jQuery tem um método 'extend' que mescla o conteúdo de dois ou
        // mais objetos, armazenando o resultado no primeiro objeto. O primeiro
        // objeto geralmente é vazio já que não queremos alterar os valores
        // padrão para futuras instâncias do plugin
        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // Coloque a lógica de inicialização aqui
            // Você já possui acesso ao elemento do DOM e as opções da instância
            // exemplo: this.element e this.options
            $this    = this;
            $options = this.options;

            if( $options.webroot === '' ) { return false; }

            // Monta os eventos condicionalmente se forem informados os elementos corretos
            if( $options.ContinenteId !== '' ) {
                $options.ContinenteId = $($options.ContinenteId);
            }
            if( $options.PaisId !== '' ) {
                $options.PaisId = $($options.PaisId);
                this.assignPais();
                if( !$.isEmptyObject($options.PaisId) && !$.isEmptyObject($options.EstadoId) ) {this.changeEstado();}
            }
            if( $options.EstadoId !== '' ) {
                $options.EstadoId = $($options.EstadoId);
                this.assignEstado();
                if( !$.isEmptyObject($options.ContinenteId) && !$.isEmptyObject($options.PaisId) ) {this.changePais();}
            }
            if( $options.CidadeId !== '' ) {
                $options.CidadeId = $($options.CidadeId);
                this.assignCidade();
                if( !$.isEmptyObject($options.EstadoId) && !$.isEmptyObject($options.CidadeId) ) {this.changeCidade();}
            }
        },

        updateChznSelect : function(){
            if( !$.isEmptyObject($options.PaisId) && $options.PaisId.hasClass('chzn-select') ) {$options.PaisId.trigger("liszt:updated");}
            if( !$.isEmptyObject($options.EstadoId) && $options.EstadoId.hasClass('chzn-select') ) {$options.EstadoId.trigger("liszt:updated");}
            if( !$.isEmptyObject($options.CidadeId) && $options.CidadeId.hasClass('chzn-select') ) {$options.CidadeId.trigger("liszt:updated");}
        },

        changePais : function(){
            $options.ContinenteId.on("change", function(){
                var ContinenteValue = $(this).val();
                var options_pais = '';

                var datas = {};

                datas['continente_id'] = ContinenteValue;
                datas['joined']  = $options.joined;
                datas = $.param(datas);
                
                $options.PaisId.html('<option value="0">'+ $options.LoadingMessage +'</option>');
                if( !$.isEmptyObject($options.EstadoId) ) { $options.EstadoId.html('<option value="0">'+ $options.PaisLoadingMessage +'</option>'); }
                if( !$.isEmptyObject($options.CidadeId) ) { $options.CidadeId.html('<option value="0">'+ $options.CidadeLoadingMessage +'</option>'); }
                
                $this.updateChznSelect();

                $.getJSON( $options.webroot + $options.PaisUrl + '?' + datas, function(j){
                    var options_pais = '<option value="0">'+ $options.PaisLoadingMessage +'</option>';

                    for (var i in j){
                        options_pais += '<option value="' + i + '">' + j[i] + '</option>';
                    }
                    $options.PaisId.html(options_pais);
                    $this.updateChznSelect();
                });
            });
        },

        // Muda os valores do selectBox Estado ao mudar o País
        // Precisa passar o valor do Pais
        changeEstado : function(){
            $options.PaisId.on("change", function(){
                var PaisValue = $(this).val();
                var options_estado = '';
                if($options.debug) console.log(PaisValue);

                var datas = {};

                datas['pais_id'] = PaisValue;
                datas['joined']  = $options.joined;
                datas = $.param(datas);
                
                $options.EstadoId.html('<option value="0">'+ $options.LoadingMessage +'</option>');
                if( !$.isEmptyObject($options.CidadeId) ) $options.CidadeId.html('<option value="0">'+ $options.CidadeLoadingMessage +'</option>');

                $this.updateChznSelect();
                
                $.getJSON( $options.webroot + $options.EstadoUrl + '?' + datas, function(j){
                    var options_estado = '<option value="0">'+ $options.EstadoLoadingMessage +'</option>';

                    for (var i in j){
                        options_estado += '<option value="' + i + '">' + j[i] + '</option>';
                    }
                    $options.EstadoId.html(options_estado);
                    $this.updateChznSelect();
                });
            });
        },

        // Muda os valores do selectBox Cidade ao mudar o Estado
        // Precisa passar o valor do Pais e do Estado
        changeCidade : function(){
            $options.EstadoId.on("change", function(){
                var EstadoValue    = $options.EstadoId.val();
                var options_cidade = '';

                var datas = {};

                if( !$.isEmptyObject($options.PaisId) ){ datas['pais_id'] = $($options.PaisId).val(); }
                datas['estado_id'] = EstadoValue;
                datas['joined']    = $options.joined;
                datas = $.param(datas);
                
                $options.CidadeId.html('<option value="0">'+ $options.LoadingMessage +'</option>');
                $this.updateChznSelect();

                $.getJSON( $options.webroot + $options.CidadeUrl + '?' + datas, function(j){
                    var options_cidade = '<option value="0">'+ $options.CidadeLoadingMessage +'</option>';
                    for (var i in j){
                        options_cidade += '<option value="' + i + '">' + j[i] + '</option>';
                    }
                    setAlert("Não foi possível carregar as cidades: ");
                    $options.CidadeId.html(options_cidade);
                    $this.updateChznSelect();
                }).fail(function(jqXHR, textStatus) { 
                    setAlert("Não foi possível carregar as cidades: " + textStatus);
                });
            });
        },

        assignPais : function(){
            var model = 'Pais';
            $('#AddGeo'+model).on('click', function(event){
                $this.switchPais();
                $this.switchEstado();
                $this.switchCidade();
            });

            $('#CancelGeo'+model).on('click', function(event){
                $this.switchPais(true);
                $this.switchEstado(true);
                $this.switchCidade(true);
            });
        },

        assignEstado : function(){
            var model = 'Estado';
            $('#AddGeo'+model).on('click', function(event){
                $this.switchEstado();
                $this.switchCidade();
            });

            $('#CancelGeo'+model).on('click', function(event){
                $this.switchEstado(true);
                $this.switchCidade(true);
            });
        },

        assignCidade : function(){
            var model = 'Cidade';
            $('#AddGeo'+model).on('click', function(event){
                $this.switchCidade();
            });

            $('#CancelGeo'+model).on('click', function(event){
                $this.switchCidade(true);
            });
        },

        switchPais : function(reset){
            var model    = 'Pais';
            var reset    = reset ? true : false;
            var control1 = $('.lista_geo-'+model);
            var control2 = $('.input_new-'+model);
            control1.toggleClass('hidden');
            control2.toggleClass('hidden');

            if(reset){
                $this.resetPais();
                $this.resetEstado();
                $this.resetCidade();
            }
        },

        switchEstado : function(reset){
            var model    = 'Estado';
            var reset    = reset ? true : false;
            var control1 = $('.lista_geo-'+model);
            var control2 = $('.input_new-'+model);
            
            control1.toggleClass('hidden');
            control2.toggleClass('hidden');

            if(reset){
                $this.resetEstado();
                $this.resetCidade();
            }
        },

        switchCidade : function(reset){
            var model    = 'Cidade';
            var reset    = reset ? true : false;
            var control1 = $('.lista_geo-'+model);
            var control2 = $('.input_new-'+model);
            
            control1.toggleClass('hidden');
            control2.toggleClass('hidden');

            if(reset){
                $this.resetCidade();
            }
        },

        resetPais : function(){
            $('#EmpreendimentoNewPais').val('');
        },
        resetEstado : function(){
            $('#EmpreendimentoNewEstado').val('');
        },
        resetCidade : function(){
            $('#EmpreendimentoNewCidade').val('');
        }
    };

    // Um invólucro realmente leve em torno do construtor,
    // prevenindo contra criação de múltiplas instâncias
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );