export default function htmlEncode(input) {
    try {
        var encodedStr = input.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
            return '&#'+i.charCodeAt(0)+';';
         });
         console.log("encodedStr: ", encodedStr)

         return encodedStr;

    }
    catch (error) {
        console.log("Error encoding HTML: ", error)
        return input;
    }

}
