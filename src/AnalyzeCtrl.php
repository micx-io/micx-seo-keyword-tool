<?php

namespace Micx\SeoKeywordTool;

use Brace\Router\RoutableCtrl;
use Brace\Router\Router;
use DonatelloZa\RakePlus\RakePlus;
use Micx\SeoKeywordTool\Type\T_AnalyzeRequest;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use PhpScience\TextRank\Tool\StopWords\German;


class AnalyzeCtrl implements RoutableCtrl
{


    public static function Routes(Router $router, string $mount, array $mw): void
    {
        $router->on("POST@$mount/analyze", [self::class, "analyze"]);
    }


    protected function analyzeRake (T_AnalyzeRequest $request) {
        $rake = RakePlus::create($request->text, $request->lang);
        return [
            "keywords" => $rake->sortByScore("desc")->scores(),
            "important" => null,
            "summarize" => null
        ];
    }

    protected function analyzeTextRank (T_AnalyzeRequest $request) {
        $api = new TextRankFacade();
        switch ($request->lang) {
            case "en_US":
                $api->setStopWords(new English());
                break;
            case "de_DE":
                $api->setStopWords(new German());
                break;
        }

        return [
            "keywords" => $api->getOnlyKeyWords($request->text),
            "important" => $api->getHighlights($request->text),
            "summarize" => $api->summarizeTextBasic($request->text)
        ];
    }


    public function analyze(T_AnalyzeRequest $body) {

        switch ($body->method) {
            case "RAKE":
                return $this->analyzeRake($body);
            case "TEXTRANK":
                return $this->analyzeTextRank($body);

            default: throw new \InvalidArgumentException("Invalid method '$body->method'");
        }
    }

}
