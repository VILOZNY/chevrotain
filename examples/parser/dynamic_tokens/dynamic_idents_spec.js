var expect = require("chai").expect;
var parseTerm = require("./dynamic_idents");


describe('The ability to support dynamically generated Tokens', function() {

    it('can parse terms without any custom Identifiers', function() {
        var inputText = 'name of the customers';
        var actualOutput = parseTerm(inputText, [])

        expect(actualOutput.operands).to.deep.equal(["name", "customers"]);
        expect(actualOutput.operators).to.deep.equal(["OF_THE"]);
    });

    it('can parse terms without any custom Identifiers', function() {
        var inputText = 'last name randomly from the employees';
        var actualOutput = parseTerm(inputText, ["last name"])

        expect(actualOutput.operands).to.deep.equal(["last name", "employees"]);
        expect(actualOutput.operators).to.deep.equal(["RANDOMLY_FROM_THE"]);
    });


    it('can parse a complex term', function() {
        var inputText = 'last name randomly from the employees of the company of the humans';
        var actualOutput = parseTerm(inputText, ["last name"])

        expect(actualOutput.operands).to.deep.equal(["last name", "employees", "company", "humans"]);
        expect(actualOutput.operators).to.deep.equal(["RANDOMLY_FROM_THE", "OF_THE", "OF_THE"]);
    });
});
