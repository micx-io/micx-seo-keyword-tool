KaToolsV1.ce_define("seo-sidebar", async function($tpl) {

    let scope = {
        fullsize: false,
        lang: "de_DE",
        method: "TEXTRANK",
        result: null,
        $fn: {
            wordCount: (str) => {
                return str.trim().split(/\s+/).length;
            }
        }
    }
    await KaToolsV1.sleep(100);
    scope.result = await MicxSeoKeywordTool.query(document.body.textContent, scope.lang, scope.method)
    $tpl.render(scope);
}, KaToolsV1.html`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
<style>
.bar {
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
<section class="card position-fixed bottom-0 start-0 end-0 bg-light" style="height: 20px">

    <div ka.if="result !== null" class="overflow-scroll p-0  text-nowrap overflow-hidden" style="font-size: 10px">
        <span>Seo-Tool Keywords: [[ $fn.wordCount(document.body.textContent) ]]</span>
        <span ka.for="let keyword of result.keywords" class="ms-2">
            <b>[[keyword.keyword]]</b> [[keyword.num]] : [[ keyword.score.toPrecision(3) ]]
        </span>

    </div>

</section>

`, {shadowDom: true});


(()=>{
    let p = new URLSearchParams(location.search);
    if (p.has("seotool")) {
        console.log("Start seo tool...");
        let e = document.createElement("seo-sidebar");
        document.body.appendChild(e);
    }

})()
