<?php

namespace Micx\SeoKeywordTool;

use Brace\Router\RoutableCtrl;
use Brace\Router\Router;
use DonatelloZa\RakePlus\RakePlus;
use Laminas\Diactoros\ServerRequest;
use Micx\SeoKeywordTool\Type\T_AnalyzeRequest;
use PhpScience\TextRank\TextRankFacade;
use PhpScience\TextRank\Tool\StopWords\English;
use PhpScience\TextRank\Tool\StopWords\German;


class AnalyzeCtrl implements RoutableCtrl
{


    public static function Routes(Router $router, string $mount, array $mw): void
    {
        $router->on("POST@$mount/analyze", [self::class, "analyze"]);
        $router->on("GET@$mount/loadhtml", [self::class, "loadHtml"]);
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
        $keywords = $api->getOnlyKeyWords($request->text);
        $index = 0;
        foreach ($keywords as $key => $val) {
            if (is_numeric($key)) {
                unset($keywords[$key]);
                continue;
            }
            if ($index++ > 25)
                unset($keywords[$key]);
        }
        return [
            "keywords" => $keywords,
            "important" => $api->getHighlights($request->text),
            "summarize" => $api->summarizeTextCompound($request->text)
        ];
    }


    public function loadHtml(ServerRequest $request) {
        $url = $request->getQueryParams()["url"] ?? throw new \InvalidArgumentException("Missing query paramm 'url'");
        $url = phore_url($url);
        if ( ! preg_match("/^([a-z0-9\-]+\.)+(com|net|org|de|eu)$/", $url->getHost()))
            throw new \InvalidArgumentException("Invalid hostname");

        if ($url->getScheme() !== "http" && $url->getScheme() !== "https")
             throw new \InvalidArgumentException("Invalid scheme");
        if ($url->getPort() !== null)
            throw new \InvalidArgumentException("Port not allowed");

        ini_set("memory_limit", "8M");
        $text = phore_http_request($url)->send()->getBody();
        $text = preg_replace("|(</.+?>)|msi", "$1\n", $text);
        $text = preg_replace("|<!--.*?-->|msi", " ", $text);
        $text = preg_replace("|<script.*?>.*?</script>|msi", " ", $text);
        $text = preg_replace("|<style.*?>.*?</style>|msi", " ", $text);
        $text = preg_replace("|<template.*?>.*?</template>|msi", " ", $text);
        $text = preg_replace("|<svg.*?>.*?</svg>|msi", " ", $text);
        $text = strip_tags($text);

        $text = preg_replace("/\n\s*\n+/m", "\n\n", $text);
        $text = preg_replace("/\n +/m", "\n", $text);

        return [
            "html"  => $text
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
