// Function used to sanitise unsafe strings to prevent SQL injection
export default function sanitiseSQL(input) {
    try {

        // TODO: implement sanitisation, right now this is just returns the input
        let sanitisedInput = input

        return sanitisedInput

    } 
    catch (error) {
        console.log("Error Sanitising input:", error)
    }

}
