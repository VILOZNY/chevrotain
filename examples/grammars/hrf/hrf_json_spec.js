var assert = require("assert");
var parseHrf = require("./hrf_json").parseHrf;


describe('HRF JSON Grammar', function() {

    it('HRF - can parse a simple hrf expression without errors', function() {
        //var inputText = '5 is equal to 3';
//        var lexAndParseResult = parseHrf(inputText);
//        var lexAndParseResult = parseHrf(inputText);
//        assert.equal(lexAndParseResult.lexErrors.length, 0);
//        assert.equal(lexAndParseResult.parseErrors.length, 0);
//        assert.equal(lexAndParseResult.parseErrors.length, 0);
//        inputText = '5 is not equal to 3';
//        lexAndParseResult = parseHrf(inputText);
//        lexAndParseResult = parseHrf(inputText);
//        assert.equal(lexAndParseResult.lexErrors.length, 0);
//        assert.equal(lexAndParseResult.parseErrors.length, 0);
//        assert.equal(lexAndParseResult.parseErrors.length, 0);
//       inputText = "'efrat' is equal to 'Daphna'";
//       inputText = "'efrat' is equal to 'Daphna'";
//        //inputText = "name of the customer is equal to 'Daphna'";
//        lexAndParseResult = parseHrf(inputText);
//        lexAndParseResult = parseHrf(inputText);
//        lexAndParseResult = parseHrf(inputText);
//        assert.equal(lexAndParseResult.lexErrors.length, 0);
//        assert.equal(lexAndParseResult.parseErrors.length, 0);
        // terms
        //var inputText = 'age of the player is not equal to \'efrat\'';
        var inputText = 'age of the player is not equal to 30';
        var lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);


        // valid
        inputText = 'average of amount of all payment_rcs of all payments of all players is equal to 2';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);


        // valid only by grammer, by type  check => error
        inputText = 'average of label of all payment_rcs of all payments of all players is equal to 2';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);

        //var inputText = 'age of the player is not equal to \'efrat\'';
        var inputText = 'name of the player is not like \'efrat\'';
        var lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);

        // invalid, second phase, like valid only for strings
        inputText = 'average of label of all payment_rcs of all payments of all players is like 2';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);


        // valid only by grammer, by type  check => error
        inputText = 'age of the player is equal to 8 and average of amount of all payment_rcs of all payments of all players is equal' +
            ' to 2 or name of the player is not equal to \'efrat\'';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);

        // valid case ,
       /* inputText = 'average of amount of all payment_rcs of all payments of all players group by age of the player' +
            ' is equal' +
            ' to 2 or name of the player is not equal to \'efrat\'';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);

        // invalid (second phase)
        inputText =  inputText = 'average of amount of all payment_rcs of all payments of all players group by name of the player' +
            ' is equal' +
            ' to 2 or name of the player is not equal to \'efrat\'';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);*/


        /*(inputText = "\'efrat\' is equal to \'Daphna\'";
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);*/

        // parser error
        /*inputText = "'efrat' is equal to 3";
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);

        // lexer error
        inputText = '5 is equall to 3';
        lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);*/
    });

    /*it('can parse a simple Json without errors - Parser implemented using ES6 syntax', function() {
        // only load a file containing ES6 syntax when actually running the test
        // thus if this test is ignored the other tests can still be run in old node.js versions
        var parseJsonES6 = require("./jsonES6");
        var inputText = '{ "arr": [1,null,true], "obj": {"num":666}}';
        var lexAndParseResult = parseJsonES6(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);
    });*/
});
