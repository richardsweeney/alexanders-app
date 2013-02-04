Zepto( function( $ ) {

    /*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT / GPLv2 License.*/
    (function(a){function m(){d.setAttribute("content",g),h=!0}function n(){d.setAttribute("content",f),h=!1}function o(b){l=b.accelerationIncludingGravity,i=Math.abs(l.x),j=Math.abs(l.y),k=Math.abs(l.z),(!a.orientation||a.orientation===180)&&(i>7||(k>6&&j<8||k<8&&j>6)&&i>5)?h&&n():h||m()}var b=navigator.userAgent;if(!(/iPhone|iPad|iPod/.test(navigator.platform)&&/OS [1-5]_[0-9_]* like Mac OS X/i.test(b)&&b.indexOf("AppleWebKit")>-1))return;var c=a.document;if(!c.querySelector)return;var d=c.querySelector("meta[name=viewport]"),e=d&&d.getAttribute("content"),f=e+",maximum-scale=1",g=e+",maximum-scale=10",h=!0,i,j,k,l;if(!d)return;a.addEventListener("orientationchange",m,!1),a.addEventListener("devicemotion",o,!1)})(this);

    window.setTimeout( function () {
        window.scrollTo( 0, 1 );
    }, 0 );

    document.ontouchmove = function( e ){
       e.preventDefault();
    }

    Backbone.pubSub = _.extend({}, Backbone.Events);

    window.myLetters = [
        {
            letter: 'a',
            image: 'alexander.jpg',
            color: '#aaa',
            mp3: [1, 3],
            id: 1
        },
        {
            letter: 'c',
            image: 'conor.jpg',
            color: 'black',
            mp3: [4, 6],
            id: 2
        },
        {
            letter: 'e',
            image: 'edith.jpg',
            color: 'green',
            mp3: [7, 9],
            id: 3
        },
        {
            letter: 'h',
            image:  'hannah.jpg',
            color: 'purple',
            mp3: [10, 12],
            id: 4
        },
        {
            letter: 'l',
            image:  'liv.jpg',
            color: 'pink',
            mp3: [13, 15],
            id: 5
        },
        {
            letter: 'm',
            image:  'miah.jpg',
            color: 'black',
            mp3: [16, 18],
            id: 6
        },
        {
            letter: 'r',
            image:  'richard.jpg',
            color: 'red',
            mp3: [19, 21],
            id: 7
        },
        {
            letter: 's',
            image:  'sarah.jpg',
            color: 'blue',
            mp3: [22, 24],
            id: 8
        }
        // {
        //     letter: 'v',
        //     image:  'vanessa.jpg',
        //     color: 'blue',
        //     mp3: [25, 27],
        //     id: 9
        // }
    ];

    window.LetterModel = Backbone.Model.extend();

    window.LetterCollection = Backbone.Collection.extend({
        model: LetterModel
    });

    window.LetterView = Backbone.View.extend({
        el: $( '#app-container' ),
        initialize: function() {
            this.collection = new LetterCollection( myLetters );
            this.render();
            this.showFirst();
        },
        render: function() {
            var that = this;
            _.each( this.collection.models, function( item ) {
                that.renderLetter( item );
            });
        },
        renderLetter: function( item ) {
            var singleLetter = new Letter({ model: item });
            $( '#letters-container' ).append( singleLetter.render().el );
        },
        showFirst: function() {
            var firstLetter = this.collection.get( 1 );
            firstLetter.set( 'active', true );
        }
    });


    window.Letter = Backbone.View.extend({
        tagName: 'div',
        className: 'letter-container',
        initialize: function() {
            this.render();
            this.listenTo( this.model, 'change', this.changed );
        },
        timer: '',
        render: function() {
            var attributes = this.model.attributes;
            this.model.set( 'active', false );
            var template = _.template( $( '#letter-template' ).html(), attributes );
            this.$el.attr( 'id', attributes.id ).html( template );
            return this;
        },
        events: {
            'swipeLeft': 'nextSlide',
            'swipeRight': 'prevSlide',
            'tap': 'flip'
            // , 'click': 'flip'
        },
        nextSlide: function() {
            var model = this.model,
                id = model.get( 'id' ),
                next = id + 1,
                leftMargin = 320 * id,
                nextModel = model.collection.get( next );

            if ( nextModel !== undefined ) {
                this.move( leftMargin );
                nextModel.set( 'active', true );
            }
        },
        prevSlide: function() {
            var model = this.model,
                id = model.get( 'id' ),
                prev = id - 1;

            if ( prev !== 0 ) {
                var leftMargin = ( 320 * id ) - 640,
                    prevModel = model.collection.get( prev );

                this.move( leftMargin );
                prevModel.set( 'active', true );
            }
        },
        move: function( leftMargin ) {
            $( '#letters-container' ).css({ left: - leftMargin });
            this.model.set( 'active', false );
            this.$el.removeClass( 'active' );
        },
        flip: function() {
            Backbone.pubSub.trigger( 'flip', this );
            this.$el.toggleClass( 'active' );
        }
    });


    window.AudioView = Backbone.View.extend({
        el: $( '#audio-sprite' ),
        initialize: function() {
            Backbone.pubSub.on( 'flip', this.play, this );
        },
        timer: null,
        play: function( letterModel ) {
            var audio = this.el,
                that = this,
                startStop = letterModel.model.get( 'mp3' );

            if ( that.timer !== null )
                clearTimeout( this.timer )

            audio.pause();

            if ( !letterModel.$el.hasClass( 'active' ) ) {
                audio.play();
                audio.currentTime = startStop[0];
                this.timer = setInterval( function() {
                    if ( audio.currentTime >= startStop[1] ) {
                        audio.pause();
                        clearTimeout( that.timer );
                        that.timer = null;
                    }
                }, 250 );
            }
        }
    });


    // Nicer syntax for underscore (more like mustache)
    _.templateSettings = {
        evaluate    : /<#([\s\S]+?)#>/g,
        escape      : /\{\{([^\}]+?)\}\}(?!\})/g,
        interpolate : /\{\{([\s\S]+?)\}\}/g
    };


    // LET'S DO THIS!!!
    var letterGo = new LetterView,
        audioGo = new AudioView;


});
