var assert = require("assert");
var parseHrf = require("./hrf_json").parseHrf;


describe('HRF JSON Grammar', function() {

    it('HRF - parse,  simple,  valid syntax + semantic', function() {

        // terms
        //var inputText = 'age of the player is not equal to \'efrat\'';
        var inputText = 'age of the player is not equal to 30';
        var lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);
        }

    );
    it('HRF - parse,  andExpression with aggregation, valid syntax + semantic', function() {

        // valid by grammar., no valid by semantic
        var inputText = 'age of the player is not equal to 30 and 3 + 5 * 2 is equal to age of the player';
        var lexAndParseResult = parseHrf(inputText);

        assert.equal(lexAndParseResult.lexErrors.length, 0);
        assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );

   /* it('HRF - parse, ', function() {

        // valid only by grammer, by type  check => error
            var inputText = 'average of label of all payment_rcs of all payments of all players is equal to 2';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );*/

    it('HRF - parse, aggregation , syntax valid, semantic by type not valid', function() {



            // valid by grammar., no valid by semantic becasue of type
            var inputText = 'average of label of all payment_rcs of all payments of all players is equal to 2';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );

    it('HRF - parse,  concatenate function,  valid syntax + semantic', function() {


            // valid
            var inputText = 'name of the player is not like \'efrat\'';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );
    it('HRF - parse, aggregation , syntax valid, semantic by type not valid', function() {



           // invalid, second phase, like valid only for strings
            var inputText = 'average of amount of all payment_rcs of all payments of all players is like 2';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );
    it('HRF - parse, orExpression + aggregation , syntax valid, semantic valid', function() {



            // invalid, second phase, like valid only for strings
            var  inputText = 'age of the player is equal to 8 and average of amount of all payment_rcs of all payments of all players is equal' +
                ' to 2 or name of the player is not equal to \'efrat\'';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );
    it('HRF - parse, orExpression + aggregation , syntax valid, semantic (becasue of isCollection) not valid', function() {



            // invalid, second phase, like valid only for strings
            var  inputText = 'age of the player is equal to 8 and average of age of the player is equal' +
                ' to 2 or name of the player is not equal to \'efrat\'';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );

    it('HRF - parse,  aggreagation + where ,  valid syntax + semantic', function() {



            // invalid, second phase, like valid only for strings
            var  inputText = 'average of amount of all payment_rcs of all payments of all players where age of the player is equal to' +
                ' 30 and 30 is not equal to 20 group by name of the player';

            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );

    it('HRF - parse,  aggreagation + where + brackets ,  valid syntax + semantic', function() {




            var  inputText = 'average of amount of all payment_rcs of all payments of all players where (age of the player is equal to' +
                ' 30 and 30 is not equal to 20) group by name of the player';

            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );

    it('HRF - parse,  aggregation + where + brackets extra one ,  invalid syntax ', function() {

            var  inputText = 'average of amount of all payment_rcs of all payments of all players where (age of the player is equal to' +
                ' 30 and 30 is not equal to 20)) group by name of the player';


            try {
            var lexAndParseResult = parseHrf(inputText);
                }
            catch(e) {};

            //assert.equal(lexAndParseResult.lexErrors.length, 0);
            //assert.equal(lexAndParseResult.parseErrors.length, 1);
        }
    );

});
