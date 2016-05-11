/**
 * 2ch parser
 * Created by lycaon on 2015/01/02.
 */
declare var bbs2ch : {

    parser: {

        MenuParser: typeof MenuParser;
        SubjectParser: typeof SubjectParser;
        DatParser: typeof DatParser;

    }

};

declare class LineParser {
    parse ( data : string ) : string;
}

declare class MenuParser extends LineParser {
    _parse ( line : string ) : Array<string>;
}

declare class SubjectParser extends LineParser {
    _parse ( line : string ) : Array<string>;
}

declare class DatParser extends LineParser {
    _parse ( line : string ) : Array<string>;
}
