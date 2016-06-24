var _ = require("lodash")
var chevrotain = require("chevrotain");
var extendToken = chevrotain.extendToken;
var Lexer = chevrotain.Lexer;

// Flow Tokens
class LCurly extends Token {}
class RCurly extends Token {}
class LSquare extends Token {}
class RSquare extends Token {}
class Comma extends Token {}
// TODO: according to JS Yaml demo even in FLOW style it must be ColonSpace
class Colon extends Token {}

// Block Tokens
// TODO: according to JS Yaml demo in some cases it can be COLON_LINE_BREAK
class DashDashDash extends Token {}
class DotDotDot extends Token {}
class ColonSpace extends Token {}
class QuestionSpace extends Token {}
class DashSpace extends Token {}

// 6.1. Indentation Spaces
// http://yaml.org/spec/1.2/spec.html#id2777534
class INDENT extends Token {}
class DEDENT extends Token {}
class SAME_INDENT extends Token {}

// 6.9.1. Node Tags
// http://yaml.org/spec/1.2/spec.html#id2784064
class Tag extends Token {}

// 6.9.2. Node Anchors
// http://yaml.org/spec/1.2/spec.html#id2785586
class AnchorDef extends Token {}
class AnchorRef extends Token {}

// common Tokens

// 6.2. Separation Spaces
// http://yaml.org/spec/1.2/spec.html#id2778241 -
class WhiteSpace extends Token {}
class LineBreak extends Token {}

// 6.4. Empty Lines
// http://yaml.org/spec/1.2/spec.html#id2778853
class EmptyLine extends Token {}



class PlainScalar extends Token {}
class SingleQuoteScalar extends Token {}
class SingleQuoteMultiLineScalar extends Token {}
class DoubleQuoteScalar extends Token {}
class DoubleQuoteMultilineScalar extends Token {}


const BLOCK = "BLOCK";
const FLOW = "FLOW";
const SPACE = " ";


const skippedFlowTokens = [WhiteSpace, LineBreak]
const skippedBlockTokens = [WhiteSpace, LineBreak]
/**
 * @param {string} text
 *
 * @constructor
 */
class YamlLexer {
    constructor(text) {
        this.text = text;
        this.currLine = 1;
        this.currColumn = 1;
        this.currOffset = 0;
        this.errors = [];
    }

    nextToken(context, indentationLevel) {

        let nextTokenFunc = context === BLOCK ?
            this.nextBlockToken :
            this.nextFlowToken;

        let skippedTokens = context === BLOCK ?
            skippedBlockTokens :
            skippedFlowTokens;

        let nextToken

        while (true) {
            try {
                nextToken = nextTokenFunc.call(this, indentationLevel);
                if (!_.includes(skippedTokens, nextToken.constructor)) {
                    return nextToken;
                }
            }
            catch (e) {
                // TODO: combine error messages of sequences instead of one error message per unexpected character
                this.errors.push(e)
            }
        }

    }

    // TODO: indentLevel should start at -1 from the parser?
    nextBlockToken(indentationLevel) {
        var startLine = this.currLine;
        var startColumn = this.currColumn;
        var startOffset = this.currOffset;
        // TODO: track endLine for multi line tokens support

        var ch = this.NEXT_CHAR();

        // TODO: support multi line tokens and Indentation
        if (startColumn === 1) {
            let currLineIndentationLevel = 0
            while (this.PEEK_CHAR() === SPACE) {
                ch = this.NEXT_CHAR();
                currLineIndentationLevel++;
            }

            // indent
            if (currLineIndentationLevel > indentationLevel) {
                return this.CREATE_TOKEN(INDENT, startOffset, startLine, startColumn);
            }
            // dedent
            else if (currLineIndentationLevel < indentationLevel) {
                return this.CREATE_TOKEN(DEDENT, startOffset, startLine, startColumn);
            }
            // no indentation change, ignore
            else {
                return this.CREATE_TOKEN(SAME_INDENT, startOffset, startLine, startColumn);
            }

        }
        // TODO: scan plainScalar handling
        switch (ch) {
            case "\r" :
                return this.scanCarriageReturn(startLine, startColumn, startOffset);
                break;
            case "\n" :
                return this.scanLineFeedReturn(startLine, startColumn, startOffset);
                break;
            case "\"":
                return this.scanSingleQuoteScalar(startLine, startColumn, startOffset);
                break;
            case "'":
                return this.scanSingleQuoteScalar(startLine, startColumn, startOffset);
                break;
            case ":":
                if (this.PEEK_CHAR() === SPACE) {
                    this.NEXT_CHAR();
                    this.CREATE_TOKEN(ColonSpace, startOffset, startLine, startColumn);
                }
                else {
                    // TODO: error, in block context a colon must be followed by a space
                }
                break;
            default:
                // add resync code here
                throw new Error("sad sad panda, nothing matched");
        }
    }

// TODO wrap in error recovery loop?
    nextFlowToken() {
        var startLine = this.currLine;
        var startColumn = this.currColumn;
        var startOffset = this.currOffset;
        // TODO: track endLine for multi line tokens support

        var ch = this.NEXT_CHAR();
        // add to switch case?
        if (this.isWhiteSpace(ch)) {
            return; // ignore whitespace
        }

        // TODO: scan plainScalar handling
        switch (ch) {
            case "\r" :
                return this.scanCarriageReturn(startLine, startColumn, startOffset);
                break;
            case "\n" :
                return this.scanLineFeedReturn(startLine, startColumn, startOffset);
                break;
            case "\"":
                return this.scanSingleQuoteScalar(startLine, startColumn, startOffset)
                break;
            case "'":
                return this.scanSingleQuoteScalar(startLine, startColumn, startOffset)
                break;
            case ",":
                return new Comma(",", startOffset, startLine, startColumn)
                break;
            case "{":
                return new LCurly("{", startOffset, startLine, startColumn)
                break;
            case "}":
                return new RCurly("}", startOffset, startLine, startColumn)
                break;
            case "[":
                return new LSquare("[", startOffset, startLine, startColumn)
                break;
            case "]":
                return new RSquare("]", startOffset, startLine, startColumn,)
                break;
            case ":":
                return new Colon(":", startOffset, startLine, startColumn,)
                break;
            default:
                // add resync code here
                throw new Error("sad sad panda, nothing matched");
        }
    }

    scanCarriageReturn() {
        var ch2 = this.PEEK_CHAR();
        if (ch2 === "\n") {
            this.NEXT_CHAR();
        }
        this.currLine++;
        this.currColumn = 1;

        // TODO: return some Token
        return;
    }

    scanLineFeedReturn() {
        this.currLine++;
        this.currColumn = 1;

        // TODO: return some Token
        return;
    }

    isWhiteSpace() {

    }

    scanSingleQuoteScalar(startLine, startColumn, startOffset) {
        let nc = undefined;
        let nc2 = undefined;
        let foundTerminatingQuote = false;

        function consumeChar() {
            nc = this.NEXT_CHAR();
            nc2 = this.PEEK_CHAR();
        }

        consumeChar();

        while (isPrintableChar(nc) && !foundTerminatingQuote) {
            // escaped "'"
            if (nc === "'" && nc2 === "'") {
                consumeChar();
                consumeChar();
            }
            // terminating "'"
            else if (nc === "'") {
                consumeChar();
                foundTerminatingQuote = true;
            }
            // still inside te single quoteScalar
            else {
                consumeChar();
            }
            // TODO handle multi - line quotes (this is context dependent?)
        }
        // TODO: handle unterminated edge case
        return this.CREATE_TOKEN(SingleQuoteScalar, startOffset, startLine, startColumn);
    }

    SKIP_CHAR() {
        // TODO: should line/column be handled here?
        // or was it handled externally?
        // probably externally if possible to avoid duplicate logic for different kinds of line breaks.
        this.currOffset++
    }

    /**
     * @return {string}
     */
    PEEK_CHAR() {
        return this.text.charAt(this.currOffset + 1);
    }

    /**
     * @return {string}
     */
    NEXT_CHAR() {
        return this.text.charAt(++this.currOffset);
    }

    /**
     * @return {string}
     */
    LAST_TOKEN_IMAGE(startOffset) {
        return this.text.substring(startOffset, this.currOffset)
    }

    CREATE_TOKEN(tokType, startOffset, startLine, startColumn) {
        let image = this.LAST_TOKEN_IMAGE(startOffset);
        return new tokType(image, startOffset, startLine, startColumn, this.currLine, this.currColumn);
    }


}


module.exports = {

    YamlLexer: YamlLexer,

    tokens: {
        LCurly:                     LCurly,
        RCurly:                     RCurly,
        LSquare:                    LSquare,
        RSquare:                    RSquare,
        Comma:                      Comma,
        Colon:                      Colon,
        DashDashDash:               DashDashDash,
        DotDotDot:                  DotDotDot,
        ColonSpace:                 ColonSpace,
        QuestionSpace:              QuestionSpace,
        DashSpace:                  DashSpace,
        INDENT:                     INDENT,
        DEDENT:                     DEDENT,
        SAME_INDENT:                SAME_INDENT,
        Tag:                        Tag,
        AnchorDef:                  AnchorDef,
        AnchorRef:                  AnchorRef,
        WhiteSpace:                 WhiteSpace,
        LineBreak:                  LineBreak,
        PlainScalar:                PlainScalar,
        SingleQuoteScalar:          SingleQuoteScalar,
        SingleQuoteMultiLineScalar: SingleQuoteMultiLineScalar,
        DoubleQuoteScalar:          DoubleQuoteScalar,
        DoubleQuoteMultilineScalar: DoubleQuoteMultilineScalar
    }

}
