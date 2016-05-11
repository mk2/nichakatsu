/**
 * アプリケーション
 * Created by lycaon on 2015/01/02.
 */
/// <reference path="lib/moz.d.ts"/>
/// <reference path="lib/es6-promise.d.ts"/>
/// <reference path="lib/encoding.d.ts"/>
/// <reference path="lib/bbs-2ch-parser.d.ts"/>
module Nichakatsu {

    /// <reference path="lib/l10n.d.ts"/>
    /// <reference path="lib/jquery.d.ts"/>

    /**
     * 処理を書くApp
     */
    export class App {

        static baseDevUrl = "http://localhost:9292/";

        static baseUrl = "http://";

        menuUrl : string = App.baseUrl + "menu.2ch.net/bbsmenu.html";

        menuParser : MenuParser = new bbs2ch.parser.MenuParser;

        subjParser : SubjectParser = new bbs2ch.parser.SubjectParser;

        datParser : DatParser = new bbs2ch.parser.DatParser;

        headerTitle : string = "Nichakatsu!";

        static categories : Array<any> = [];

        static boards : Array<any> = [];

        constructor () {

            // イベントハンドラを付けておく
            var updateMenuBtn = document.getElementById( "update_menu" );
            updateMenuBtn.onclick = () => {
                this.reloadBoards( this.menuUrl ).then( ( categories : Array<any> ) => {
                    App.categories = categories;
                    this.updateMenu( categories );
                } );
            };

            this.reloadBoards( this.menuUrl ).then( ( categories : Array<any> ) => {
                App.categories = categories;
                this.updateMenu( categories );
            } );
        }

        /**
         * DAT内容をリロード
         * @param datUrl
         * @param callback
         */
        reloadDat ( datUrl : string ) {
            return new Promise( ( resolve, reject ) => {
                var xhr = mozutil.getXMLHttpRequest();
                xhr.open( "GET", datUrl, true );
                xhr.responseType = "arraybuffer";
                xhr.onload = ( e ) => {
                    if ( xhr.status == 200 ) {
                        var dat = [];
                        var content = App.convertUnicode( xhr.response ).split( "\n" ).filter( ( e : string, i, arr ) => <boolean>( e && e.length > 0) );
                        for ( var i = 0; i < content.length; i++ ) {
                            var parsed = this.datParser._parse( content[ i ] );
                            if ( typeof parsed !== "undefined" ) {
                                dat.push( parsed );
                            }
                        }
                        resolve( dat );
                    } else {
                        reject( "can not load dat" );
                    }
                };
                xhr.onerror = () => {
                    reject( "can not load dat" );
                };
                xhr.send( null );
            } );
        }

        /**
         * スレ内容一覧リロード
         * @param boardUrl
         * @param callback
         */
        reloadThreads ( boardUrl : string ) {
            return new Promise( ( resolve, reject ) => {
                var xhr = mozutil.getXMLHttpRequest();
                xhr.open( "GET", boardUrl, true );
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                    if ( xhr.status == 200 ) {
                        var threads = [];
                        var content = App.convertUnicode( xhr.response ).split( "\n" );
                        for ( var i = 0; i < content.length; i++ ) {
                            var parsed = this.subjParser._parse( content[ i ] );
                            if ( typeof parsed !== "undefined" ) {
                                threads.push( parsed );
                            }
                        }
                        resolve( threads );
                    } else {
                        reject( "can not load threads" );
                    }
                };
                xhr.onerror = () => {
                    reject( "can not load threads" );
                };
                xhr.send( null );
            } );
        }

        /**
         * 板一覧リロード
         * @param menuUrl
         */
        reloadBoards ( menuUrl : string ) {
            return new Promise( ( resolve, reject ) => {
                var xhr = mozutil.getXMLHttpRequest();
                xhr.open( "GET", menuUrl, true );
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                    if ( xhr.status == 200 ) {
                        var content = App.convertUnicode( xhr.response ).split( "\n" );
                        var categoriesMap = {};
                        for ( var i = 0; i < content.length; i++ ) {
                            var parsed = this.menuParser._parse( content[ i ] );
                            if ( typeof parsed !== "undefined" ) {
                                var category = parsed[ "category" ];
                                var title = parsed[ "title" ];
                                var url = parsed[ "url" ];
                                if ( !(category in categoriesMap) ) {
                                    categoriesMap[ category ] = [];
                                }
                                categoriesMap[ category ].push( {category : category, title : title, url : url} );
                            }
                        }
                        var categories = [];
                        var keys = Object.keys( categoriesMap );
                        for ( var i = 0; i < keys.length; i++ ) {
                            var key = keys[ i ];
                            categories.push( {title : key, boards : categoriesMap[ key ]} );
                        }
                        resolve( categories );
                    } else {
                        reject( "can not load data" );
                    }
                };
                xhr.onerror = () => {
                    reject( "can not load data" );
                };
                xhr.send( null );
            } );
        }

        updateMenu ( categories : Array<any> ) {
            var ulELm = <HTMLElement> document.getElementById( "menu" ).querySelector( "ul" );

            categories = categories[0].boards

            // 一度クリアしておく
            ulELm.innerHTML = "";

            for ( var i = 0; i < categories.length; i++ ) {
                var category = categories[ i ];

                var liElm = document.createElement( "li" );
                liElm.onclick = (function ( i : number ) {
                    console.log("touched");
                    return function () {
                        app.updateBoards( i );
                    };
                })( i );
                liElm.innerHTML = category[ "title" ];

                ulELm.appendChild( liElm );
            }
            App.categories = categories;
        }

        updateBoards ( idx : number ) {
            var boards = App.categories[ idx ][ "boards" ];
            var ulElm = <HTMLElement> document.getElementById( "boards" ).querySelector( "ul" );

            // 内容を一度クリアしておく
            ulElm.innerHTML = "";

            for ( var i = 0; i < boards.length; i++ ) {
                var board = boards[ i ];
                var liElm = document.createElement( "li" );

                var url = board[ "url" ];
                var title = board[ "title" ];

                liElm.innerHTML = title;
                liElm.onclick = (function ( url : string ) {
                    return function () {
                        app.updateThreads( url );
                    };
                })( url );

                ulElm.appendChild( liElm );
            }

            App.boards = boards;
        }

        updateThreads ( url : string ) {
            var baseUrl = App.baseDevUrl + url.substr( 7 );
            var reqUrl = App.baseDevUrl + url.substr( 7 ) + "subject.txt";
            console.log( reqUrl );

            var ulElm = <HTMLElement> document.getElementById( "threads" ).querySelector( "ul" );

            // 内容をクリアする
            ulElm.innerHTML = "";

            this.reloadThreads( reqUrl ).then( ( threads : Array<any> ) => {
                for ( var i = 0; i < threads.length; i++ ) {
                    var thread = threads[ i ];
                    var title = thread[ "title" ];
                    var id = thread[ "id" ];
                    var liElm = document.createElement( "li" );
                    liElm.innerHTML = title;
                    liElm.onclick = (function ( id : string ) {
                        return function () {
                            app.updateDat( baseUrl + "dat/" + id + ".dat" );
                        };
                    })( id );
                    ulElm.appendChild( liElm );
                }
            } );
        }

        updateDat ( url : string ) {
            var ulElm = <HTMLElement> document.getElementById( "dat" ).querySelector( "ul" )

            // 内容をクリアする
            ulElm.innerHTML = "";

            this.reloadDat( url ).then( ( datArray : Array<any> ) => {
                for ( var i = 0; i < datArray.length; i++ ) {
                    var dat = datArray[ i ];
                    var liElm = document.createElement( "li" );
                    liElm.innerHTML = dat[ "name" ] + " : " + dat[ "body" ];
                    ulElm.appendChild( liElm );
                }
            } );
        }

        updateHeaderTitle ( headerTitle : string ) {
            var headerTitleElm = document.getElementById( "header_title" );
            headerTitleElm.innerHTML = headerTitle;
        }

        /**
         * SJISをユニコードに変換する
         * @param str
         * @returns {string}
         */
        static convertUnicode ( str : ArrayBuffer ) : string {
            var uInt8Array = new Uint8Array( str );
            var utf8Array = Encoding.convert( uInt8Array, "UTF8", "SJIS" );
            var unicodeArray = Encoding.convert( utf8Array, "UNICODE", "AUTO" );

            return Encoding.codeToString( unicodeArray );
        }

    }

}

var app : Nichakatsu.App;
window.addEventListener( "DOMContentLoaded", () => app = new Nichakatsu.App() );

