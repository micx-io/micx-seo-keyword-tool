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
    let scope = {
        text: "",
        lang: "de_DE",
        method: "TEXTRANK",
        languages: ["en_US", "de_DE"],
        methods: ["RAKE", "TEXTRANK"],
        result: null,

        $fn: {
            update: async () => {

                scope.text = scope.$ref.textarea1.value;
                await KaToolsV1.debounce(1000,1000000);

                scope.result = await MicxSeoKeywordTool.query(scope.text, scope.lang, scope.method)

                $tpl.render();
            },
            loadHtml: async (url) => {
                scope.text = await MicxSeoKeywordTool.loadHtml(url);
                scope.$ref.textarea1.value = scope.text;
                await scope.$fn.update();
            }
        }
    }
    $tpl.render(scope);



}, KaToolsV1.html`

<section class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-8">
                    <input type="url" class="w-75 mb-3" ka.ref="'url1'" placeholder="http://xyz.de/path/file.html"><button ka.on.click="$fn.loadHtml($ref.url1.value)">Load Data</button>

            </div>
            <div class="col-4">
                <span>Sprache: </span><select ka.options="languages" ka.on.change="$fn.update()" ka.bind="$scope.lang"></select>
                <span> Methode: </span><select ka.options="methods" ka.on.change="$fn.update()" ka.bind="$scope.method"></select>
            </div>
        </div>
        <div class="row">
            <div class="col-8">


                <textarea ka.ref="'textarea1'" ka.on.keyup="$fn.update()" ka.on.change="$fn.update()" class="w-100 h-100 mb-2" placeholder="Bitte Text hier eingeben"></textarea>
            </div>

            <div class="col-4">

                <div class="card overflow-scroll p-1" style="max-height: 300px" ka.if="result.important !== null">
                    <p class="fw-bold">Key Sentence</p>

                    <p ka.for="let key in result.important">[[key]]: [[result.important[key] ]]</p>
                    <p class="fw-bold">Summary:</p>
                    <p ka.for="let key in result.summarize">[[key]]: [[result.summarize[key] ]]</p>

                </div>
                <table ka.if="result !== null" class="table table-hover overflow-scroll" style="max-height: 250px">
                    <thead>
                        <tr>
                            <td class="fw-bold">Keyword</td>
                            <td class="fw-bold">Score</td>

                        </tr>
                    </thead>
                    <tbody class=" " >
                    <tr ka.for="let keyword in result.keywords" >
                        <td>[[keyword]]</td>
                        <td>[[ result.keywords[keyword].toPrecision(3) ]]</td>


                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</section>

`);
