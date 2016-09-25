var assert = require("assert");
var parseHrf = require("./hrf_json").parseHrf;


describe('HRF JSON Grammar', function() {

    it('HRF - parse, function cocncatnate , syntax + semantic valid', function() {



            // valid by grammar., no valid by semantic becasue of type
            var inputText = 'concatenate(\'Today is: \', \'9/1/2016\') = \'Today is: 9/1/2016\'';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );


    it('HRF - parse,  orExpression + andExpression , valid syntax +  vailid semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 is not equal to 3 and 7 + 3 is not equal to 8 or 5  is not equal to age of the player';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );


    it('HRF - parse,  orExpression , valid syntax +  invalid semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 is not equal to  6 or 7 + 3 is not equal to 8 or age of the player';
            try {
                var lexAndParseResult = parseHrf(inputText);

            }
            catch(e) {
                console.log(e)
            };

        }
    );




    it('HRF - parse,  orExpression , valid syntax +  invalid semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 or 7 + 3 is not equal to 8 or 5  is not equal to age of the player';

        try {
            var lexAndParseResult = parseHrf(inputText);
        }

        catch(e) {
            console.log(e)
            }
        }
    );



    it('HRF - parse,  andExpression , valid syntax +  invalid semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 is not equal to 3 and 7 + 3 + 6 and 5  is not equal to age of the player';
            try {
                var lexAndParseResult = parseHrf(inputText);
            }

            catch(e) {
                console.log(e)
            };
        }
    );



   it('HRF - parse,  andExpression , valid syntax +  semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 is not equal to 3 and 7 + 3 is not equal to 8 and 5  is not equal to age of the player';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );


    it('HRF - parse,  andExpression , valid syntax + semantic', function() {

            // valid by grammar., no valid by semantic
            var inputText = '5 is not equal to 3 and 7 + 3 is not equal to 8';
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }
    );


    it('HRF - parse,  simple, valid syntax, valid semantic', function() {

            // terms
            //var inputText = 'age of the player is not equal to \'efrat\'';
            var inputText = "-3";

            var lexAndParseResult = parseHrf(inputText);



            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }

    );

    it('HRF - parse,  simple, valid syntax, invalid semnatic', function() {

        var lexAndParseResult;
            // terms
            //var inputText = 'age of the player is not equal to \'efrat\'';
            var inputText = "-'efrat'";
        try {
            lexAndParseResult = parseHrf(inputText);
        }
        catch(e) {
            console.log(e)
        };

            //assert.equal(lexAndParseResult.lexErrors.length, 0);
           // assert.equal(lexAndParseResult.parseErrors.length, 0);
        }

    );
    //return;
  /* it('HRF - parse,  simple', function() {

            // terms
            //var inputText = 'age of the player is not equal to \'efrat\'';
            var inputText = "   5   is equal to        3  ";
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }

    );
return*/

     it('HRF - parse,  simple', function() {

             // terms
             //var inputText = 'age of the player is not equal to \'efrat\'';
             var inputText = "1 is equal to 2";
             var lexAndParseResult = parseHrf(inputText);

             assert.equal(lexAndParseResult.lexErrors.length, 0);
             assert.equal(lexAndParseResult.parseErrors.length, 0);
         }

     );


    it('HRF - parse,  simple,  valid syntax + arithmetic', function() {

            // terms
            //var inputText = 'age of the player is not equal to \'efrat\'';
            var inputText = "1*2/3 + 3*5 - 7 - 8*9*10 is equal to 11";
            var lexAndParseResult = parseHrf(inputText);

            assert.equal(lexAndParseResult.lexErrors.length, 0);
            assert.equal(lexAndParseResult.parseErrors.length, 0);
        }

    );

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



    it('HRF - parse, aggregation , syntax valid, semantic by type not valid', function() {



            // valid by grammar., no valid by semantic becasue of type
            var inputText = 'average of id of all payment_rcs of all payments of all players is equal to 2';
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
            try {
                var lexAndParseResult = parseHrf(inputText);
            }
            catch(e) {
                console.log(e)
            };

          //  assert.equal(lexAndParseResult.lexErrors.length, 0);
          //  assert.equal(lexAndParseResult.parseErrors.length, 0);
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
            catch(e) {console.log(e)};

            //assert.equal(lexAndParseResult.lexErrors.length, 0);
            //assert.equal(lexAndParseResult.parseErrors.length, 1);
        }
    );

});
