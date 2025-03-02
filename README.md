# Go Strings Highlight

Go Strings Highlight is a VS Code extension that enhances Go code readability by highlighting format string placeholders and escape sequences. This helps developers quickly identify and understand formatted strings, reducing errors and improving efficiency.  

## Features  
- **Highlight placeholders** (`%d`, `%s`, `%v`, etc.) in Go format strings  
- **Highlight escape sequences** (`\n`, `\t`, `\\`, `\xFF`, etc.)  
- **Customizable colors** via VS Code settings  
- **Efficient performance** with debounced updates  

## How It Works  
1. Scans Go source files for string literals.  
2. Detects placeholders and escape sequences.  
3. Applies syntax highlighting with configurable colors.  

## Configuration  
You can customize highlight colors in `settings.json`:  
```json
"go-strings-highlight.colors.placeholderColor": "#ffcc00",
"go-strings-highlight.colors.escapeSequenceColor": "#ff6666"
```

## Screenshots

![](./Screenshot_1.png)
![](./Screenshot_2.png)
