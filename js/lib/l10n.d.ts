/**
 * l10n definition file
 * Created by lycaon on 2014/12/31.
 */

/**
 * l10nのパブリックAPIはナビゲータにプロパティとして追加されるっぽい
 */
interface Navigator {

    mozL10n : {
        ctx : Context;
        once : {
            ( callback : {( any ) : any} ) : void;
        };
        get : {
            ( id : any, ctxdata : any ) : string;
        };
    };

}

/**
 * コンテキストクラス
 */
declare class Context {

}
