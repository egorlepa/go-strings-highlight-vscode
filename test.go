package main

// should ignore comments
// %b, %d, %o, %x %X
// "%b, %d, %o, %x %X"
// \a, \b, \\, \t, \n, \f, \r, \v
// "\a, \b, \\, \t, \n, \f, \r, \v"
// `\a, \b, \\, \t, \n, \f, \r, \v`
func mai2n() {
	char := '\n'
	char = '\U0001F600'
	_ = char
	text := "%v	the value in a default format when printing structs, the plus flag (%+v) adds field names"
	text = "%#v	a Go-syntax representation of the value (floating-point infinities and NaNs print as ±Inf and NaN)"
	text = "%T	a Go-syntax representation of the type of the value"
	text = "%%	a literal percent sign; consumes no value"
	text = "%%v	%%s %%v %%%v %%%%v"
	text = "%t	the word true or false"
	text = "%b	base 2"
	text = "%c	the character represented by the corresponding Unicode code point"
	text = "%d	base 10"
	text = "%o	base 8"
	text = "%O	base 8 with 0o prefix"
	text = "%q	a single-quoted character literal safely escaped with Go syntax."
	text = "%x	base 16, with lower-case letters for a-f"
	text = "%X	base 16, with upper-case letters for A-F"
	text = "%U	Unicode format: U+1234; same as \"U+%04X\""
	text = "%b	decimalless scientific notation with exponent a power of two, in the manner of strconv.FormatFloat with the 'b' format, e.g. -123456p-78"
	text = "%e	scientific notation, e.g. -1.234456e+78"
	text = "%E	scientific notation, e.g. -1.234456E+78"
	text = "%f	decimal point but no exponent, e.g. 123.456"
	text = "%F	synonym for %f"
	text = "%g	%e for large exponents, %f otherwise. Precision is discussed below."
	text = "%G	%E for large exponents, %F otherwise"
	text = "%x	hexadecimal notation (with decimal power of two exponent), e.g. -0x1.23abcp+20"
	text = "%X	upper-case hexadecimal notation, e.g. -0X1.23ABCP+20"
	text = "%s	the uninterpreted bytes of the string or slice"
	text = "%q	a double-quoted string safely escaped with Go syntax"
	text = "%x	base 16, lower-case, two characters per byte"
	text = "%X	base 16, upper-case, two characters per byte"
	text = "%p	address of 0th element in base 16 notation, with leading 0x"
	text = "%p	base 16 notation, with leading 0x"
	text = "The %b, %d, %o, %x and %X verbs also work with pointers, formatting the value exactly as if it were an integer."
	text = "%f     default width, default precision"
	text = "%9f    width 9, default precision"
	text = "%.2f   default width, precision 2"
	text = "%9.2f  width 9, precision 2"
	text = "%9.f   width 9, precision 0"
	text = "%w error wrapping"
	text = "\a	U+0007 alert or bell"
	text = "\b	U+0008 backspace"
	text = "\\	U+005c backslash"
	text = "\t	U+0009 horizontal tab"
	text = "\n	U+000A line feed or newline"
	text = "\f	U+000C form feed"
	text = "\r	U+000D carriage return"
	text = "\v	U+000b vertical tab"
	text = "backslash+x followed by exactly two hexadecimal digits: \x0f \x55 \xce"
	text = "backslash followed by exactly three octal digits: \077 \123 \123"
	text = "backslash+u followed by exactly four hexadecimal digits: \uABCD \u1a2f \u1234"
	text = "backslash+U followed by exactly eight hexadecimal digits: \U0001F600 \U0001F603 \U0001F604 \U0001F601"
	text = `
	should be highlighted: 
	%T, %%, %t, %b, %c, %d, %o, %O, %q, %x, %X, %U, %b, %e, %E, %f, %F, %g, %G, %x, %X, %s, %q, %x, %X, %p, %p
	should not be highlighted:
	\a, \b, \\, \t, \n, \f, \r, \v, \x0f, \077, \uABCD, \U0001F600
	`
	_ = text
}
