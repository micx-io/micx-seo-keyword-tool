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
    "subscription_id": "%%SERVICE_ID%%",
    "endpoint_url": "%%ENDPOINT_URL%%",
    "debug": false
  },
  query: async (text, lang, method) => {
      let result = await fetch(MicxSeoKeywordTool.attrs.endpoint_url, {
          method: "post",
          body: JSON.stringify({text, lang, method}),
          headers: {
              "Content-Type": "application/json"
          }
      });
      return await result.json();
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
                scope.$ref.textarea1.rows = scope.text.split(/\n|\r|\r\n/g).length + 1
                scope.text = scope.$ref.textarea1.value;
                await KaToolsV1.debounce(1000,1000000);

                scope.result = await MicxSeoKeywordTool.query(scope.text, scope.lang, scope.method)

                $tpl.render();
            }
        }
    }
    $tpl.render(scope);



}, KaToolsV1.html`

<section class="card">
    <div class="card-body">




    <textarea ka.ref="'textarea1'" ka.on.keyup="$fn.update()" class="w-100 mb-2" placeholder="Bitte Text hier eingeben"></textarea>
    <span>Sprache: </span><select ka.options="languages" ka.on.change="$fn.update()" ka.bind="$scope.lang"></select>
    <span> Methode: </span><select ka.options="methods" ka.on.change="$fn.update()" ka.bind="$scope.method"></select>

    <div class="row mt-3" ka.if="result !== null">
        <h4 class="mt-5 mb-3">Analyseergebnis</h4>
        <div class="col-6">
            <div class="card " ka.if="result.important !== null">
                <div class="card-header"><h5>Important sentence</h5></div>
                <div class="card-body">
                    <p ka.for="let key in result.important">[[key]]: [[result.important[key] ]]</p>
                </div>
            </div>
        </div>

        <div class="col-6">
            <div class="card " ka.if="result.summarize !== null">
                <div class="card-header"><h5>Summary</h5></div>
                <div class="card-body">
                    <p ka.for="let key in result.summarize">[[key]]: [[result.summarize[key] ]]</p>
                </div>
            </div>
        </div>

    </div>


    <table ka.if="result !== null" class="table table-hover">
        <thead>
            <tr>
                <td class="fw-bold">Keyword</td>
                <td class="fw-bold">Score</td>

            </tr>
        </thead>
        <tbody>
        <tr ka.for="let keyword in result.keywords">
            <td>[[keyword]]</td>
            <td>[[ result.keywords[keyword].toPrecision(3) ]]</td>
        </tr>
        </tbody>
    </table>

    </div>
</section>

`);
