<?php

$user = $_GET['username'];

if(!isset($user)) die('No Username given');

$url = 'https://www.younow.com/php/api/broadcast/info/curID=0/user=' . $user;

$header = array();
$curl = curl_init();
$header[] = "Cache-Control: max-age=0";
$header[] = "Connection: keep-alive";
$header[] = "Keep-Alive: 300";
$header[] = "Origin: http://younow.com/";

curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:7.0.1) Gecko/20100101 Firefox/7.0.12011-10-16 20:23:00");
curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
curl_setopt($curl, CURLOPT_REFERER, "http://www.younow.com");
curl_setopt($curl, CURLOPT_AUTOREFERER, true);
curl_setopt($curl, CURLOPT_TIMEOUT, 30);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION,true);
$html = json_encode(curl_exec($curl));
curl_close($curl);