/**
 * Micx.io Whois Service
 *
 * Usage: See https://github.com/micx-io/micx-whois
 *
 * @licence MIT
 * @author Matthias Leuffen <m@tth.es>
 */

const MicxSeoKeywordTool = {
  attrs: {
    "subscription_id": "%%SUBSCRIPTION_ID%%",
    "endpoint_url": "%%ENDPOINT_URL%%",
    "debug": false
  },
  query: async (text, lang, method) => {
      let result = await fetch(MicxSeoKeywordTool.attrs.endpoint_url + "/analyze?subscription_id=" + MicxSeoKeywordTool.attrs.subscription_id, {
          method: "post",
          body: JSON.stringify({text, lang, method}),
          headers: {
              "Content-Type": "application/json"
          }
      });
      return await result.json();
  },
  loadHtml: async(url) => {
     let result = await fetch(MicxSeoKeywordTool.attrs.endpoint_url + "/loadhtml?url="+ encodeURIComponent(url) +"&subscription_id=" + MicxSeoKeywordTool.attrs.subscription_id, {
          method: "get"
      });
      return (await result.json()).html;
  }
}


KaToolsV1.ce_define("seo-keyword-tool", function($tpl) {
    let caretTo = function (el, index) {
        const selection = window.getSelection();
        const range = document.createRange();
        selection.removeAllRanges();
        range.selectNodeContents(el);
        range.setStart(el, index-1);
        range.setEnd(el, index-1);
        selection.addRange(range);
        el.focus();
    };

    let scope = {
        fullsize: false,
        text: "",
        lang: "de_DE",
        method: "TEXTRANK",
        languages: ["en_US", "de_DE"],
        methods: ["RAKE", "TEXTRANK"],
        result: null,

        $fn: {

            highlight: (word, color) => {
                let c = scope.$ref.textarea1.innerHTML;

                c = c.replaceAll(new RegExp(word, "ig"), (str) => {
                    return `<span style="background-color: ${color}">${str}</span>`
                });
                let focusOffset = document.getSelection().focusOffset;
                console.log(focusOffset)
                scope.$ref.textarea1.innerHTML = c;
                caretTo(scope.$ref.textarea1, focusOffset);
            },

            update: async () => {

                scope.text = scope.$ref.textarea1.textContent;
                await KaToolsV1.debounce(1000,1000000);

                scope.result = await MicxSeoKeywordTool.query(scope.text, scope.lang, scope.method)
                for (let keyw of scope.result.keywords)
                    scope.$fn.highlight(keyw.keyword, "#ccc")
                $tpl.render();
            },
            loadHtml: async (url) => {
                scope.text = await MicxSeoKeywordTool.loadHtml(url);
                scope.$ref.textarea1.textContent = scope.text;
                await scope.$fn.update();
            },
            toggleFullsize: () => {
                scope.fullsize = ! scope.fullsize;
                $tpl.render();
            }
        }
    }
    $tpl.render(scope);



}, KaToolsV1.html`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
<style>
.fullsize {
    z-index: 999999;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 2px;
    padding-bottom: 60px;

}
</style>
<section class="card" ka.classlist.fullsize="fullsize">
    <div class="card-header">
        <span class="fs-3">Leuffen.de Keyword Tool</span>
        <button class="btn position-absolute btn-outline end-0" ka.on.click="$fn.toggleFullsize()">
            <i class="bi bi-arrows-fullscreen" ></i>
        </button>
    </div>
    <div class="card-body h-100">
        <div class="row">
            <div class="col-8">
                    <input type="url" class="w-75 mb-3" ka.ref="'url1'" placeholder="http://xyz.de/path/file.html"><button ka.on.click="$fn.loadHtml($ref.url1.value)">Load Data</button>

            </div>
            <div class="col-4">
                <span>Sprache: </span><select ka.options="languages" ka.on.change="$fn.update()" ka.bind="$scope.lang"></select>
                <span class="ms-3"> Algo: </span><select ka.options="methods" ka.on.change="$fn.update()" ka.bind="$scope.method"></select>
            </div>
        </div>
        <div class="row h-100">
            <div class="col-8 position-relative">

                <pre ka.ref="'textarea1'" contenteditable="true" ka.on.keyup="$fn.update()" ka.on.change="$fn.update()" class="position-relative w-100 " style="height: 95%">Text eingeben</pre>
                <!--textarea ka.ref="'textarea1'" ka.on.keyup="$fn.update()" ka.on.change="$fn.update()" class="position-relative w-100 " style="height: 95%" placeholder="Bitte Text hier eingeben"></textarea-->
            </div>

            <div class="col-4 h-100 position-relative" ka.if="result !== null">

                <div class="card overflow-scroll p-1 mb-2 position-relative w-100" style="max-height:40%; height: 40%;" ka.if="result.important !== null">
                    <p class="fw-bold">Key Sentence</p>

                    <p ka.for="let key in result.important">[[key]]: [[result.important[key] ]]</p>
                    <p class="fw-bold">Summary:</p>
                    <p ka.for="let key in result.summarize">[[key]]: [[result.summarize[key] ]]</p>

                </div>
                <div class="card overflow-scroll p-1 position-relative w-100" style="max-height:50%; height: 55%;">
                    <table ka.if="result !== null" class="table table-hover overflow-scroll" >
                        <thead>
                            <tr>
                                <td class="fw-bold">Keyword</td>
                                <td class="fw-bold">Num</td>
                                <td class="fw-bold">Score</td>

                            </tr>
                        </thead>
                        <tbody class=" " style="max-height: 120px">
                        <tr ka.for="let keyword of result.keywords" ka.on.click="$fn.highlight(keyword.keyword, '#ccc')">
                            <td>[[keyword.keyword]]</td>
                            <td>[[keyword.num]]</td>
                            <td>[[ keyword.score.toPrecision(3) ]]</td>


                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</section>

`, {shadowDom: true});
