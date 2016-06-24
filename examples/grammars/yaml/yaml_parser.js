var chevrotain = require("chevrotain");

// ----------------- lexer -----------------
var Parser = chevrotain.Parser;
var tokens = require("./yaml_lexer").tokens

var LCurly = tokens.LCurly
var RCurly = tokens.RCurly
var LSquare = tokens.LSquare
var RSquare = tokens.RSquare
var Comma = tokens.Comma
var Colon = tokens.Colon
var DashDashDash = tokens.DashDashDash
var DotDotDot = tokens.DotDotDot
var ColonSpace = tokens.ColonSpace
var QuestionSpace = tokens.QuestionSpace
var DashSpace = tokens.DashSpace
var INDENT = tokens.INDENT
var DEDENT = tokens.DEDENT
var SAME_INDENT = tokens.SAME_INDENT
var Tag = tokens.Tag
var AnchorDef = tokens.AnchorDef
var AnchorRef = tokens.AnchorRef
var WhiteSpace = tokens.WhiteSpace
var LineBreak = tokens.LineBreak
var PlainScalar = tokens.PlainScalar
var SingleQuoteScalar = tokens.SingleQuoteScalar
var SingleQuoteMultiLineScalar = tokens.SingleQuoteMultiLineScalar
var DoubleQuoteScalar = tokens.DoubleQuoteScalar
var DoubleQuoteMultilineScalar = tokens.DoubleQuoteMultilineScalar

// ----------------- parser -----------------

function YamlParser(input) {
    // invoke super constructor
    Parser.call(this, input, allTokens, {
            // by default the error recovery / fault tolerance capabilities are disabled
            // use this flag to enable them
            recoveryEnabled: true
        }
    );

    this.lexerContext = "BLOCK"

    // not mandatory, using <$> (or any other sign) to reduce verbosity (this. this. this. this. .......)
    var $ = this;

    this.document = this.RULE("document", function() {
        $.MANY(() => {
            $.OPTION(()=> {
                $.CONSUME(DashDashDash)
            })

            $.OR([
                {ALT: () => {$.SUBRULE($.flowStyle)}},
                {ALT: () => {$.SUBRULE($.BlockStyle)}}
            ])

            $.OPTION(()=> {
                $.CONSUME(DotDotDot)
            })
        })
    });

    this.flowStyle = this.RULE("flowStyle", function() {

    });

    this.flowMapping = this.RULE("flowMapping", function() {
        $.CONSUME(LCurly)

        $.MANY_SEP(Comma, () => {
            $.SUBRULE($.flowEntry)
        })

        $.OPTION(() => {
            $.CONSUME(Comma)
        })
        $.CONSUME(RCurly)
    });



    function roundDownFunction(x) {
       return Math.floor(x)
    }

    class Person {

        constructor(age) {
            this._age = age;
        }


        roundDownMethod(x) {
            return Math.floor(x)
        }

        calledFromInsideClass() {
            return roundDownFunction(this._age)
            return this.roundDownMethod(this._age)
        }
    }

    var callingFunctionResult = roundDownFunction(666.6)
    var callingMethodResult = (new Person(5)).roundDownMethod(666.6)

    this.flowEntry = this.RULE("flowEntry", function() {
        // TODO: support empty flow entry with '? '
        // TODO: support  set notation :   baseball teams: !!set { Boston Red Sox, Detroit Tigers, New York Yankees }
        // this means an entry without colons!
        $.OPTION(function() {
            $.CONSUME(QuestionSpace)
        })

        $.SUBRULE($.flowKey)
        $.CONSUME(Colon)

        $.OPTION(function() {
            $.CONSUME(Tag)
        })

        $.SUBRULE($.flowContents)
    })

    this.flowSequence = this.RULE("flowSequence", function() {
        $.CONSUME(LSquare)

        $.MANY_SEP(Comma, () => {
            $.SUBRULE($.flowContents)
        })

        $.OPTION(() => {
            $.CONSUME(Comma)
        })
        $.CONSUME(RSquare)
    });

    this.flowContents = this.RULE("flowContents", function() {
        $.OR([
            {ALT: () => {$.SUBRULE($.flowMapping)}},
            {ALT: () => {$.SUBRULE($.flowSequence)}},
            {ALT: () => {$.CONSUME(PlainScalar)}},
            {ALT: () => {$.CONSUME(DoubleQuoteScalar)}},
            {ALT: () => {$.CONSUME(SingleQuoteScalar)}},
            {ALT: EMPTY_ALT("Null Node's contents")}
        ])
    });

    this.flowContents = this.RULE("flowSequenceContents", function() {
        $.OR([
            {ALT: () => {$.SUBRULE($.flowMapping)}},
            {ALT: () => {$.SUBRULE($.flowEntry)}},
            {ALT: () => {$.SUBRULE($.flowSequence)}},
            {ALT: () => {$.CONSUME(PlainScalar)}},
            {ALT: () => {$.CONSUME(SingleQuoteMultiLineScalar)}},
            {ALT: () => {$.CONSUME(DoubleQuoteScalar)}},
            {ALT: () => {$.CONSUME(DoubleQuoteMultilineScalar)}},
            {ALT: EMPTY_ALT("Empty Node")}
        ])
    });

    this.flowKey = this.RULE("flowKey", function() {
        // a flow key may not contain multi line scalars
        $.OR([
            {ALT: () => {$.CONSUME(PlainScalar)}}, // is this also limited to a single line?
            {ALT: () => {$.CONSUME(SingleQuoteScalar)}},
            {ALT: () => {$.CONSUME(DoubleQuoteScalar)}}
            // TODO: implicit/complex key?
        ])
    });

    this.blockStyle = this.RULE("BlockStyle", function() {

        $.CONSUME(INDENT)

        $.OR([
            {ALT: () => { $.SUBRULE($.blockSequence) }},
            {ALT: () => { $.SUBRULE($.blockMapping) }},
        ]);

        $.OR([
            {ALT: () => { $.CONSUME(DEDENT) }},
            // TODO: when existing top level blockNode
            {WHEN: () => {}, THEN_DO: chevrotain.EMPTY_ALT},
        ]);
    });

    this.blockSequence = this.RULE("blockSequence", function() {
        $.AT_LEAST_ONE(() => {
            $.CONSUME(SAME_INDENT)
            $.CONSUME(DashSpace)
            $.OR([
                {ALT: () => { $.SUBRULE($.blockStyleScalar) }},
                {ALT: () => { $.SUBRULE($.blockStyle) }},
                {ALT: () => { $.SUBRULE($.flowStyle) }},
            ]);
        })
    });

    this.blockMapping = this.RULE("blockMapping", function() {
        $.AT_LEAST_ONE(() => {
            $.CONSUME(SAME_INDENT)
            // TODO: use BACKTRACK ???
            // TODO: this can be an implicit key too with max size 1024 chars
            $.SUBRULE($.blockKey)
            $.CONSUME(ColonSpace)

            $.OR([
                {ALT: () => { $.SUBRULE($.blockStyleScalar) }},
                {ALT: () => { $.SUBRULE($.blockStyle) }},
                {ALT: () => { $.SUBRULE($.flowStyle) }},
            ]);
        })
    });

    this.blockStyleScalar = this.RULE("blockStyleScalar", function() {
    });


    this.flowStyleScalar = this.RULE("flowStyleScalar", function() {
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
}

YamlParser.prototype.LA = function() {

    switch (this.lexerContext) {
        case BLOCK :
            // ....
            break;
        case FLOW:
            // ....
            break;
    }

}

YamlParser.prototype.SKIP_TOKEN = function() {

}

YamlParser.prototype.ruleFinallyStateUpdate = function() {

}


// inheritance as implemented in javascript in the previous decade... :(
YamlParser.prototype = Object.create(Parser.prototype);
YamlParser.prototype.constructor = YamlParser;

// ----------------- wrapping it all together -----------------

// TODO: repeating pattern for all grammar examples, factor out ?
module.exports = function(text) {
    var fullResult = {};
    var lexResult = JsonLexer.tokenize(text);
    fullResult.tokens = lexResult.tokens;
    fullResult.ignored = lexResult.ignored;
    fullResult.lexErrors = lexResult.errors;

    var parser = new YamlParser(lexResult.tokens);
    parser.json();
    fullResult.parseErrors = parser.errors;

    if (fullResult.lexErrors.length >= 1 || fullResult.parseErrors.length >= 1) {
        throw new Error("sad sad panda")
    }
    return fullResult;
};