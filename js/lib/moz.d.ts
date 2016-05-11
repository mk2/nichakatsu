/**
 * Firefox OS特有の拡張を吸収する
 * Created by lycaon on 2015/01/02.
 */
interface MozUtil {
    getXMLHttpRequest() : XMLHttpRequest;
}

declare var mozutil : MozUtil;
