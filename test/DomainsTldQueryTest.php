<?php

namespace Test;

use Micx\Whois\WhoisFacet;

class DomainsTldQueryTest extends \PHPUnit\Framework\TestCase
{


    public function testRegistered()
    {
        $q = new WhoisFacet();
        $this->assertEquals(true, $q->query("wurst.de")->isRegistered);
        $this->assertEquals(true, $q->query("wurst.com")->isRegistered);
        $this->assertEquals(true, $q->query("wurst.net")->isRegistered);
        $this->assertEquals(true, $q->query("wurst.org")->isRegistered);
        $this->assertEquals(true, $q->query("wurst.eu")->isRegistered);
        $this->assertEquals(true, $q->query("test.nrw")->isRegistered);
        $this->assertEquals(true, $q->query("shop.saarland")->isRegistered);
    }

    public function testNotRegistered()
    {
        $q = new WhoisFacet();
        $this->assertEquals(false, $q->query("wurst938774.de")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.com")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.net")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.org")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.eu")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.nrw")->isRegistered);
        $this->assertEquals(false, $q->query("wurst938774.saarland")->isRegistered);
    }

    public function testInvalid()
    {
        $q = new WhoisFacet();
        $this->assertEquals(false, $q->query("hal--lo.de")->isRegistered);
    }
}
