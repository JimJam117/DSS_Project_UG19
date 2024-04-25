// Function used to sanitise unsafe strings to prevent SQL injection
export default function sanitiseSQL(input) {
    try {
        let sanitisedInput = input.replace(/['"]/g, '');
        const stringsToCheck = ['AND', 'OR', 'NOT', ';', '/*', '--', '=', '!=', '<', '>',
        '\\\', \'%\', \'_\'',
        'UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'UPDATE', 'COUNT', 'SUM', 'AVG', 'MIN',
        'MAX', 'CONCAT', 'SUBSTRING', 'CAST', 'CASE'];

        for (const string of stringsToCheck) {
            const searchIndex = sanitisedInput.toUpperCase().indexOf(string);

            //will return -1 if the checked string is not an index of the input
            if (searchIndex !== -1) {
                sanitisedInput = sanitisedInput.split(string.toUpperCase()).join('');
            }
        }
        
        return sanitisedInput
    }
    catch (error) {
        console.log("Error Sanitising input:", error)
    }

}
