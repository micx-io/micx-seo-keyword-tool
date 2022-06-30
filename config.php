<?php

define("DEV_MODE", (bool)"1");

define("CONF_SUBSCRIPTION_ENDPOINT", "/opt/mock/sub");
define("CONF_SUBSCRIPTION_CLIENT_ID", "micx-seo-keyword-tool");
define("CONF_SUBSCRIPTION_CLIENT_SECRET", "");

if (DEV_MODE === true) {
    define("CONFIG_PATH", "/opt/cfg");
} else {
    define("CONFIG_PATH", "/config");
}


