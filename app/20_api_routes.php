<?php
namespace App;



use Brace\Core\AppLoader;
use Brace\Core\BraceApp;
use Lack\Subscription\Type\T_Subscription;
use Laminas\Diactoros\ServerRequest;


use Micx\SeoKeywordTool\AnalyzeCtrl;
use Psr\Http\Message\ServerRequestInterface;

AppLoader::extend(function (BraceApp $app) {

    $mount = "/v1/seo-keyword-tool";

    $app->router->on("GET@$mount/seo-keyword-tool.js", function (BraceApp $app, T_Subscription $subscription,  ServerRequestInterface $request) use ($mount) {
        $data = file_get_contents(__DIR__ . "/../src/kasimir.js");
        $data .= file_get_contents(__DIR__ . "/../src/seo-tool.js");
        $data .= file_get_contents(__DIR__ . "/../src/seo-sidebar.js");

        $data = str_replace(
            ["%%ENDPOINT_URL%%", "%%SUBSCRIPTION_ID%%"],
            [
                "//" . $app->request->getUri()->getHost() . "$mount",
                $subscription->subscription_id
            ],
            $data
        );

        return $app->responseFactory->createResponseWithBody($data, 200, ["Content-Type" => "application/javascript"]);
    });


    $app->router->registerClass($mount, AnalyzeCtrl::class);



});
