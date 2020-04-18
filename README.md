# SERENA

## Laravel like Routing for Google Apps Script

Vanilla JS Router with 0 dependencies targeting Google App Scripts. Using ideas of Laravel/ExpressJs

[![Video installation image](http://img.youtube.com/vi/JDPusC1d-dU/0.jpg)](http://www.youtube.com/watch?v=JDPusC1d-dU)


## Basic Example (Code and Web)

Using basic bootstrap template as layout. The code below or you have the file [here](https://github.com/raultm/serena/blob/master/resources/basic_example.gs)

```js
/*
*  When you publish a project as webpage, two Methode doGet & doPost are use to interact.
*
*  In the project we bypass this two methods to handle(request), creating the request object, 
*   - If you are in a Google Suite account and publish with the option "Who has access to the app: Anyone within {Company}" you have access to user email
*   - If you are using @gmail.com account or use a public access you received empty string for Session.getActiveUser().getEmail()
*   - If you want the app "Execute the app as: User accessing the app" Session.getEffectiveUser().getEmail() will give you user's email
*
*  In handle(), we 
*   - Setup the routes of our project
*   - return generate reponse
*/

function doGet(e) {
  var path = e.pathInfo?"/" + e.pathInfo:"/"
  return handle({ method: "get", path: path, user: Session.getActiveUser().getEmail()})
}

function doPost(e) {
  var path = e.pathInfo?"/" + e.pathInfo:"/"
  return handle({ method: "post", postdata: e,path: path, user: Session.getActiveUser().getEmail()})
}

function handle(request) {
 setupRoutes()
 return generateResponse(Serena.Router.handle(request));
}

function setupRoutes() {
 Serena.Router.get("/", home) 
 Serena.Router.get("/numbers", () => [1,2,3,4]) 
 Serena.Router.get("/hi/{name}/{surname}", (data) => `¡Hola ${data.name} ${data.surname}!`) 
}

function generateResponse(response){
  // response = { status: XXX, body: "YYY" }
  var htmltemplate_view = HtmlService.createTemplate(getView());
  htmltemplate_view.body = response.body
  var htmlview = htmltemplate_view.evaluate().getContent()
  
  var htmltemplate =  HtmlService.createTemplate(getLayout());
  htmltemplate.content = htmlview
  html = htmltemplate.evaluate()
  
  return html.setTitle("Serena Library Example").addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function link(path){
  return "https://script.google.com/a/educarex.es/macros/s/AKfycbxt54YEUc5PBWhVbCk8hgqet9uZL4ma57GxJz4g-_IjyuEBTr4/exec" + path
}

function home(data, request, response) {
  return `
  <div class="row">
    <div class="col">
      <a href="${ ScriptApp.getService().getUrl() }/numbers">Numbers</a>
    </div>
    <div class="col">
      <a href="${ ScriptApp.getService().getUrl() }/hi/Raul/Tierno">Say Hi!</a>
    </div>
    <div class="col">
      <a href="${ ScriptApp.getService().getUrl() }/dont/exists">URL not exists</a>
    </div>
  </div>
`
}

function getView() {
  // != if you dont want to escape html tags, = if you want to escape
  return `<div class="container"><?!=body ?></div>`
}

function getLayout() {
  return `
<!doctype html>
<html lang="es">
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  </head>
  <body>
    <div class="container">
      <a href="${ ScriptApp.getService().getUrl() }">
        <h1 class='mt-5'>Serena Router Example</h1>
      </a>
    </div>
    <div class="container">
        <?!=content ?>
    </div>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
</html>
`
}
`
}
```

## Installation 

Project Library Id 

`1T2vzgCURm0jQABfV6zve_MKzZRNRRkAcM4KurzJ1aZNvg_XxwKHsic_d`

Resources > Libraries... 

Add the ID and select version


