
mocha.checkLeaks();

window.onload = typeof __karma__ === 'undefined' && function() {
  mocha.run();
};

//document.write('<script src="' + (window.__karma__ ? "/base/test/" : "") + 'unit/spec.js" charset="utf-8"><\/script>');
