import { GetAllUsers, GetAllUsersForQuery, CreateUser, GetUserByUsername } from '../models/User.js';
import {GetAllMovies, GetAllMoviesForQuery} from '../models/Movie.js'
import { CreateReview, GetAllReviews, GetAllReviewsForMovieId, GetAllReviewsForQuery, GetAllReviewsForUserId, GetReviewForMovieByUserId, DeleteReview } from '../models/Review.js';
import { assert } from 'chai';
import sanitiseSQL from '../scripts/sanitiseSQL.js';

describe('Find Movie Records Test', function() {
    it("Testing 4 movies can be found in Movies model:", async function(){
        const movies = await GetAllMovies();
        
        assert.equal(movies.length, 4);
    });

    it("Testing movie 'Dune' can be found in Movies model:", async function(){
        const movies = await GetAllMovies();
        
        // is Dune in the movies array?
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "Dune") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, true);
    });

    it("Testing movie 'The Taste of Things' can be found in Movies model:", async function(){
        const movies = await GetAllMovies();
        
        // is Dune in the movies array?
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "The Taste of Things") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, true);
    });

    it("Testing movie 'Perfect Days' can be found in Movies model:", async function(){
        const movies = await GetAllMovies();
        
        // is movie in the movies array?
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "Perfect Days") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, true);
    });

    it("Testing movie 'Shayda' can be found in Movies model:", async function(){
        const movies = await GetAllMovies();

        // is movie in the movies array?
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "Shayda") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, true);
    });

});

describe('Find User Records Test', function() {
    it("Testing at least 3 users can be found in Users model:", async function(){
        const users = await GetAllUsers();
        
        assert.isAtLeast(users.length, 3);
    });

    it("Testing user 'Tom F.' can be found in Users model:", async function(){
        const users = await GetAllUsers();
        let userPresent = false

        for (const user of users) {
            if (user.username === "Tom F.") {
                userPresent = true
            }
        }

        assert.equal(userPresent, true);
    });

    it("Testing user 'Tom F.' is not an admin:", async function(){
        const users = await GetAllUsers();
        let isAdmin = true

        for (const user of users) {
            if (user.username === "Tom F.") {
                isAdmin = user.is_admin
            }
        }

        assert.equal(isAdmin, false);
    });

    it("Testing user 'John H.' can be found in Users model:", async function(){
        const users = await GetAllUsers();
        let userPresent = false

        for (const user of users) {
            if (user.username === "John H.") {
                userPresent = true
            }
        }

        assert.equal(userPresent, true);
    });

    it("Testing user 'John H.' is not an admin:", async function(){
        const users = await GetAllUsers();
        let isAdmin = true

        for (const user of users) {
            if (user.username === "John H.") {
                isAdmin = user.is_admin
            }
        }

        assert.equal(isAdmin, false);
    });

    it("Testing user 'admin' can be found in Users model:", async function(){
        const users = await GetAllUsers();
        let userPresent = false

        for (const user of users) {
            if (user.username === "admin") {
                userPresent = true
            }
        }

        assert.equal(userPresent, true);
    });

    it("Testing user 'admin' is an admin:", async function(){
        const users = await GetAllUsers();
        let isAdmin = false

        for (const user of users) {
            if (user.username === "admin") {
                isAdmin = user.is_admin
            }
        }

        assert.equal(isAdmin, true);
    });
});

describe('Find Review Records Test', function() {
    it("Testing at least 3 reviews can be found in Reviews model:", async function(){
        const reviews = await GetAllReviews();
        
        assert.isAtLeast(reviews.length, 3);
    });

    it("Testing review 'I liked Dune' can be found in Reviews model:", async function(){
        const reviews = await GetAllReviews();
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }

        assert.equal(reviewPresent, true);
    });

    it("Testing review 'I liked Dune' can be found via Author's ID:", async function(){
        const reviews = await GetAllReviewsForUserId(3);
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }
        
        assert.equal(reviewPresent, true);
    });

    it("Testing review 'I liked Dune' can be found via Movie's ID:", async function(){
        const reviews = await GetAllReviewsForMovieId(1);
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }
        
        assert.equal(reviewPresent, true);
    });


    it("Testing review 'I liked Dune' cannot be found via incorrect Author's ID:", async function(){
        const reviews = await GetAllReviewsForUserId(2);
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }
        
        assert.equal(reviewPresent, false);
    });

    it("Testing review 'I liked Dune' cannot be found via incorrect Movie's ID:", async function(){
        const reviews = await GetAllReviewsForMovieId(2);
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }
        
        assert.equal(reviewPresent, false);
    });

});

describe('Find Records Via Search Query Test', function() {
    it("Testing user 'John H.' is found via the search query 'john':", async function(){
        const users = await GetAllUsersForQuery("john");
        let userPresent = false

        for (const user of users) {
            if (user.username === "John H.") {
                userPresent = true
            }
        }

        assert.equal(userPresent, true);
    });

    it("Testing user 'John H.' is not found via the search query 'mike':", async function(){
        const users = await GetAllUsersForQuery("mike");
        let userPresent = false

        for (const user of users) {
            if (user.username === "John H.") {
                userPresent = true
            }
        }

        assert.equal(userPresent, false);
    });

    it("Testing movie 'The Taste of Things' is found via the search query 'taste':", async function(){
        const movies = await GetAllMoviesForQuery("taste");
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "The Taste of Things") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, true);
    });

    it("Testing movie 'The Taste of Things' is not found via the search query 'smell':", async function(){
        const movies = await GetAllMoviesForQuery("smell");
        let moviePresent = false

        for (const movie of movies) {
            if (movie.title === "The Taste of Things") {
                moviePresent = true
            }
        }

        assert.equal(moviePresent, false);
    });

    it("Testing review 'I liked Dune' is found via the search query 'i liked':", async function(){
        const reviews = await GetAllReviewsForQuery("i liked");
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }

        assert.equal(reviewPresent, true);
    });

    it("Testing review 'I liked Dune' is not found via the search query 'unrelated text':", async function(){
        const reviews = await GetAllReviewsForQuery("unrelated text");
        let reviewPresent = false

        for (const review of reviews) {
            if (review.title === "I liked Dune") {
                reviewPresent = true
            }
        }

        assert.equal(reviewPresent, false);
    });

});

describe('Create User Test', function() {
    it("Testing User Can Sign Up", async function(){
        await CreateUser("MochaTestUser", "mocha@test.com", "mocha");
        
        const user = await GetUserByUsername("MochaTestUser");

        assert.equal(user.email, "mocha@test.com");
        assert.equal(user.is_admin, false);
    });

});

describe('Create / Delete Review Test', function() {
    let testUserId = 0;

    it("Testing User Can Sign Up (Review Test):", async function(){
        await CreateUser("MochaReviewTestUser", "mochareview@test.com", "mocha");
        
        const user = await GetUserByUsername("MochaReviewTestUser");

        testUserId = user.id;

        assert.equal(user.email, "mochareview@test.com");
        assert.equal(user.is_admin, false);
    });

    it("Testing Can Create Review:", async function(){
        await CreateReview(2, "Mocha Review", "My Mocha Test Review", testUserId, 1);

        const review = await GetReviewForMovieByUserId(1, testUserId);

        assert.equal(review.title, "Mocha Review");
        assert.equal(review.body, "My Mocha Test Review");
        assert.equal(review.rating, 2);
    });

    it("Testing Can Delete Review:", async function(){
        const review = await GetReviewForMovieByUserId(1, testUserId);

        await DeleteReview(review.id);

        const testUserReviews = await GetAllReviewsForUserId(testUserId);

        assert.isEmpty(testUserReviews);
    });
});



describe('SQL Sanatisation Test', function() {
    it("Testing SQL Sanatisation removes quotes, semicolons and equals signs:", async function(){
        const input = "'uname, password from users where $id=1;"

        const output = sanitiseSQL(input)
        assert.equal(output, "uname, password from users where $id1");
    });

    it("Testing SQL Sanatisation removes SELECT keyword:", async function(){
        const input = "'SELECT uname, password from users where $id=1;"

        const output = sanitiseSQL(input)
        assert.equal(output, " uname, password from users where $id1");
    });

    it("Testing SQL Sanatisation removes AND keyword:", async function(){
        const input = "'SELECT password from users where $id=1 AND username = 'admin';"

        const output = sanitiseSQL(input)
        assert.equal(output, " password from users where $id1  username  admin");
    });

    it("Testing SQL Sanatisation removes UNION keyword:", async function(){
        const input = "'SELECT uname, password from users UNION SELECT title from movies"

        const output = sanitiseSQL(input)
        assert.equal(output, " uname, password from users   title from movies");
    });

    it("Testing SQL Sanatisation removes INSERT keyword:", async function(){
        const input = "'INSERT INTO users uname, password VALUES hacker, password"

        const output = sanitiseSQL(input)
        assert.equal(output, " INTO users uname, password VALUES hacker, password");
    });

    it("Testing SQL Sanatisation removes UPDATE keyword:", async function(){
        const input = "'UPDATE users SET password='password' where $id=1"

        const output = sanitiseSQL(input)
        assert.equal(output, " users SET passwordpassword where $id1");
    });
    
    it("Testing SQL Sanatisation removes DELETE keyword:", async function(){
        const input = "'DELETE from users where $id=1"

        const output = sanitiseSQL(input)
        assert.equal(output, " from users where $id1");
    });

});
