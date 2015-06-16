function injectScript(filepath, query) {
  var parent = document.querySelector(query),
      script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', filepath);
  return parent.appendChild(script);
};

injectScript(chrome.extension.getURL('/dist/raw/spatialnavigation.js'), 'body');
