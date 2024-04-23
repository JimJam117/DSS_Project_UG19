export default function stringFirewallTest(input) {
    try {
        var regexp_rule = [
            /select.+(from|limit)/i,
            /(?:(union(.*?)select))/i,
            /sleep\((\s*)(\d*)(\s*)\)/i,
            /group\s+by.+\(/i,
            /(?:from\W+information_schema\W)/i,
            /(?:(?:current_)user|database|schema|connection_id)\s*\(/i,
            /\s*or\s+.*=.*/i,
            /order\s+by\s+.*--$/i,
            /benchmark\((.*)\,(.*)\)/i,
            /base64_decode\(/i,
            /(?:(?:current_)user|database|version|schema|connection_id)\s*\(/i,
            /(?:etc\/\W*passwd)/i,
            /into(\s+)+(?:dump|out)file\s*/i,
            /xwork.MethodAccessor/i,
            /(?:define|eval|file_get_contents|include|require|require_once|shell_exec|phpinfo|system|passthru|preg_\w+|execute|echo|print|print_r|var_dump|(fp)open|alert|showmodaldialog)\(/i,
            /\<(iframe|script|body|img|layer|div|meta|style|base|object|input)/i,
            /(onmouseover|onmousemove|onerror|onload)\=/i,
            /javascript:/i,
            /\.\.\/\.\.\//i,
            /\|\|.*(?:ls|pwd|whoami|ll|ifconfog|ipconfig|&&|chmod|cd|mkdir|rmdir|cp|mv)/i,
            /(?:ls|pwd|whoami|ll|ifconfog|ipconfig|&&|chmod|cd|mkdir|rmdir|cp|mv).*\|\|/i,
            /(gopher|doc|php|glob|file|phar|zlib|ftp|ldap|dict|ogg|data)\:\//i
        ];


        for (var count = 0; count < regexp_rule.length; count++) {
            if (regexp_rule[count].test(input) == true) {
                console.log("firewall violation detected: ",  regexp_rule[count]);
                return true;
            }
        }

        return false;

    }
    catch (error) {
        console.log("firewall checking error: ", error)
        return false;
    }

}
