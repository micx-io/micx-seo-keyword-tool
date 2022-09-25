KaToolsV1.ce_define("seo-sidebar", async function($tpl) {

    let keywords = document.querySelector("meta[name='keywords']");
    if (keywords !== null) {
        keywords = keywords.getAttribute("content").split(",").map(i => i.trim().toLowerCase());
    }
    let desc = document.querySelector("meta[name='description']");
    if (desc !== null) {
        desc = desc.getAttribute("content");
    }
    let scope = {
        fullsize: false,
        lang: "de_DE",
        method: "TEXTRANK",
        meta: {
            title: document.title,
            keywords: keywords !== null ? Array.from(keywords) : [],
            desc: desc
        },
        result: null,
        kwResult: [],
        $fn: {
            wordCount: (str) => {
                return str.trim().split(/\s+/).length;
            }
        }
    }
    await KaToolsV1.sleep(100);
    scope.result = await MicxSeoKeywordTool.query(document.body.innerHTML, scope.lang, scope.method);
    console.log(scope);
    scope.kwResult = scope.meta.keywords.map(e => new Object({
        keyword: e,
        score: scope.result.keywords.find(kw => kw === e) !== null ? 0 : scope.result.keywords.find(kw => kw === e).score
    }));

    $tpl.render(scope);
}, KaToolsV1.html`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

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
<section class="card position-fixed bottom-0 start-0 end-0" style="padding-left: 10px; height: 45px; z-index: 99999;background-color: #ffffff">
    <div class="overflow-scroll p-0 bg-white text-nowrap overflow-hidden" style="font-size: 10px">
        <span class="d-inline-block"  style="width: 100px;">Meta description:</span>
        [[ meta.desc ]]
    </div>
    <div ka.if="result !== null" class="overflow-scroll p-0 bg-white text-nowrap overflow-hidden" style="font-size: 10px">
        <span class="d-inline-block"  style="width: 100px;">Meta Keywords: </span>
        <span ka.for="let keyword of kwResult" class="ms-2" ka.classlist.text-success="keyword.score > 0.5" ka.classlist.text-danger="keyword.score < 0.5">
            <b>[[keyword.keyword]]</b> [[ keyword.score.toPrecision(3) ]]
        </span>

    </div>


    <div ka.if="result !== null" class="overflow-scroll p-0 bg-white text-nowrap overflow-hidden" style="font-size: 10px">
        <span>Seo-Tool Keywords: [[ $fn.wordCount(document.body.textContent) ]]</span>
        <span ka.for="let keyword of result.keywords" class="ms-2">
            <span ka.classlist.fw-bold="meta.keywords.indexOf(keyword.keyword) !== -1">[[keyword.keyword]]</span> [[keyword.num]] : [[ keyword.score.toPrecision(3) ]]
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
