var marked = require('marked');
marked.setOptions({
    gfm: true,
    breaks: true
});

module.exports = {
    compile: function(content, callback) {
        return marked(content, function(err, content) {
            content = content.replace(/(\r\n|\n|\r)/gm,"");
            callback(err, content);
        });
    }
}