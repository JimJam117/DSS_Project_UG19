import { GetAllUsers } from '../models/User.js';
import {GetAllMovies, GetMovie} from '../models/Movie.js'
import { build_webdriver } from '../config/webdriver_config.js';
import { By } from 'selenium-webdriver';

// define a test, provide a test name and a callback that returns [boolean: testResult and string:failureMsg]  
export const Test = async (testName, testCallback) => {
    // attempt to run test callback
    try {

        // retrieve test result (bool) and error message (string)
        const [testResult, failureMsg] = await testCallback();
        
        // if test passed / failed, output to console
        if (testResult) { console.log(`TEST PASSED: ${testName}`) }
        else { console.log(`TEST FAILED: ${testName} - ${failureMsg}`) }
    }

    // catch errors and print to console the failure:
    catch (e) {
        console.log(`TEST FAILED (ERROR): ${testName} - ${e}`)
    }
}

// Run all the tests
export const runUnitTests = async () => {
    
    // Find all movies test
    Test("FindMoviesTest", async () => {
        const movies = await GetAllMovies();
        
        // is there 4 movies in the DB?
        const movieCountIs4 = movies.length === 4
        
        // is Dune in the movies array?
        let dunePresent = false

        for (const movie of movies) {
            if (movie.title === "Dune") {
                dunePresent = true
            }
        }

        let failureMsg = ''
        if (!dunePresent) { failureMsg += "Dune is not in the movies array. "}
        if (!movieCountIs4) { failureMsg += "There are not 4 movies. "}

        return [movieCountIs4 && dunePresent, failureMsg]
    });


    // Find all users test
    Test("FindUsersTest", async () => {
        const users = await GetAllUsers();
        
        // is there at least 3 users in the DB?
        const atLeast3Users = users.length >= 3
        
        // is Admin in the movies array?
        let adminPresent = false

        for (const user of users) {
            if (user.username === "admin") {
                adminPresent = true
            }
        }

        let failureMsg = ''
        if (!adminPresent) { failureMsg += "Admin is not in the user array. "}
        if (!atLeast3Users) { failureMsg += "There are not at least 3 users. "}

        return [atLeast3Users && adminPresent, failureMsg]
    });
}

// Selenium End to End Tests
export const runSeleniumTests = async () => {
    
    await Test('CreateUserE2ETest', async () => {
        // setup
        const driver = await build_webdriver();
        await driver.get('https://localhost:5000/');

        // click signup link
        await driver.findElement(By.id('new_account')).click();

        // enter email used by another user already
        await driver.findElement(By.id('email')).sendKeys("admin@movies.com");
        await driver.findElement(By.id('uname')).sendKeys("TestUser");
        await driver.findElement(By.id('password')).sendKeys("TestUser");
        await driver.findElement(By.id('submit')).click();

        // is 'username / email already exists' text visible?
        let error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "That username / email already exists! Please log in.") {
            driver.quit()
            return [false, "Could not find 'That username / email already exists! Please log in.' error for already used email."]
        }

        // clear inputs
        await driver.findElement(By.id('email')).clear();
        await driver.findElement(By.id('uname')).clear();
        await driver.findElement(By.id('password')).clear();

        // enter already used username
        await driver.findElement(By.id('email')).sendKeys("test@test.com");
        await driver.findElement(By.id('uname')).sendKeys("admin");
        await driver.findElement(By.id('password')).sendKeys("TestUser");
        await driver.findElement(By.id('submit')).click();

        // is 'username / email already exists' text visible?
        error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "That username / email already exists! Please log in.") {
            driver.quit()
            return [false, "Could not find 'That username / email already exists! Please log in.' error for already used username."]
        }

        // clear inputs
        await driver.findElement(By.id('email')).clear();
        await driver.findElement(By.id('uname')).clear();
        await driver.findElement(By.id('password')).clear();

        // enter correct details
        await driver.findElement(By.id('email')).sendKeys("test@test.com");
        await driver.findElement(By.id('uname')).sendKeys("TestUser");
        await driver.findElement(By.id('password')).sendKeys("TestUser");
        await driver.findElement(By.id('submit')).click();

        // is 'logged in as ...' text is visible?
        let logged_in_msg = await driver.findElement(By.className('logged_in_msg')).getText();
        if (logged_in_msg != "Logged in as: TestUser") {
            driver.quit()
            return [false, "Could not find 'Logged in as: TestUser' text."]
        }

        // test passed
        driver.quit()
        return [true, ""]
    })


    await Test('UserLoginE2ETest', async () => {
        // setup
        const driver = await build_webdriver();
        await driver.get('https://localhost:5000/');

        // click login link
        await driver.findElement(By.id('login')).click();

        // submit incorrect username
        await driver.findElement(By.id('uname')).sendKeys("Wrong Name");
        await driver.findElement(By.id('password')).sendKeys("password");
        await driver.findElement(By.id('submit')).click();
        
        // is 'Username and / or password is incorrect' text visible?
        let error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "Username and / or password is incorrect.") {
            driver.quit()
            return [false, "Could not find 'Username and / or password is incorrect.' error for incorrect username."]
        }

        // clear inputs
        await driver.findElement(By.id('uname')).clear();
        await driver.findElement(By.id('password')).clear();

        // submit correct username but wrong password
        await driver.findElement(By.id('uname')).sendKeys("Tom F.");
        await driver.findElement(By.id('password')).sendKeys("wrongpass");
        await driver.findElement(By.id('submit')).click();

        // is 'Username and / or password is incorrect' text visible?
        error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "Username and / or password is incorrect.") {
            driver.quit()
            return [false, "Could not find 'Username and / or password is incorrect.' error for incorrect password."]
        }

        // clear inputs
        await driver.findElement(By.id('uname')).clear();
        await driver.findElement(By.id('password')).clear();
        
        // submit correct login details for test user Tom F.
        await driver.findElement(By.id('uname')).sendKeys("Tom F.");
        await driver.findElement(By.id('password')).sendKeys("password");
        await driver.findElement(By.id('submit')).click();

        // is 'logged in as ...' text is visible?
        let logged_in_msg = await driver.findElement(By.className('logged_in_msg')).getText();
        if (logged_in_msg != "Logged in as: Tom F.") {
            driver.quit()
            return [false, "Could not find 'Logged in as: Tom F.' text."]
        }

        // log out
        await driver.findElement(By.id('logout')).click();
        
        // is login button is visible?
        let isLoginButtonVisible = await driver.findElement(By.id('login')).isDisplayed();
        if (!isLoginButtonVisible) {
            driver.quit()
            return [false, "Could not find 'login' button, suggesting a user is still logged in."]
        }

        // test passed
        driver.quit()
        return [true, ""]
    })


    await Test('ReviewE2ETest', async () => {
        // setup
        const driver = await build_webdriver();
        await driver.get('https://localhost:5000/');

        // click login link and login
        await driver.findElement(By.id('login')).click();
        await driver.findElement(By.id('uname')).sendKeys("John H.");
        await driver.findElement(By.id('password')).sendKeys("password");
        await driver.findElement(By.id('submit')).click();
        
        // attempt to find test review (should not be present)
        await driver.findElement(By.id('query')).sendKeys("test review");
        await driver.findElement(By.id('query')).submit();
        await driver.sleep(2000);
        if (!await driver.findElement(By.className('no_results'))) {
            driver.quit()
            return [false, "Expected no results message when searching for test review - was not present."]
        }
        
        // click new review
        await driver.findElement(By.id('new_review')).click();

        // attempt to create empty review for movie already reviewed on this account
        await driver.findElement(By.id('create_review_submit')).click();

        // is 'Your account has already made a review for this movie' text visible?
        let error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "Your account John H. has already made a review for this movie Dune.") {
            driver.quit()
            return [false, "Could not find 'Your account John H. has already made a review for this movie Dune.' error text."]
        }

        // attempt to create empty review for movie NOT already reviewed on this account
        await driver.findElement(By.xpath('//select[@id="movie_id"]/option[4]')).click();
        await driver.findElement(By.id('create_review_submit')).click();

        // is 'The title is empty' text visible?
        error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "The title is empty.") {
            driver.quit()
            return [false, "Could not find 'The title is empty.' error text."]
        }

        // attempt to create review with title only
        await driver.findElement(By.xpath('//select[@id="movie_id"]/option[4]')).click();
        await driver.findElement(By.id('title')).sendKeys("Test Review");
        await driver.findElement(By.id('create_review_submit')).click();

        // is 'The body is empty' text visible?
        error_msg = await driver.findElement(By.className('error')).getText();
        if (error_msg != "The body is empty.") {
            driver.quit()
            return [false, "Could not find 'The body is empty.' error text."]
        }

        // attempt to create correct review
        await driver.findElement(By.xpath('//select[@id="movie_id"]/option[4]')).click();
        await driver.findElement(By.id('title')).sendKeys("Test Review");
        await driver.findElement(By.id('body')).sendKeys("This is a Test Review.");
        await driver.findElement(By.id('create_review_submit')).click();

        // check we can see the review contents
        let h1 = await driver.findElement(By.xpath("//div[@class='review']/h1")).getText();
        let stars = await driver.findElement(By.xpath("//span[@class='stars']")).getText();
        if (h1 != "Test Review" || stars != "★ ☆ ☆ ☆ ☆") {
            driver.quit()
            return [false, "Could not find review contents."]
        }

        // attempt to find test review (should be present)
        await driver.findElement(By.id('query')).sendKeys("test review");
        await driver.findElement(By.id('query')).submit();
        await driver.sleep(2000);
        let reviewLink = await driver.findElement(By.xpath("//span[contains(text(),'Test Review')]"))
        if (!reviewLink) {
            driver.quit()
            return [false, "Expected result when searching for test review - was not present."]
        }

        // attempt to click on review
        await reviewLink.click();

        // attempt to delete review
        await driver.findElement(By.id('delete_review_button')).click();
        
        // attempt to find test review (should not be present)
        await driver.findElement(By.id('query')).sendKeys("test review");
        await driver.findElement(By.id('query')).submit();
        await driver.sleep(2000);
        if (!await driver.findElement(By.className('no_results'))) {
            driver.quit()
            return [false, "Expected no results message when searching for test review - was not present."]
        }

        // test passed
        driver.quit()
        return [true, ""]
    })

    
}