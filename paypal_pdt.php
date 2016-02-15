<?php

// $tx -> transaction id
// $tkn -> token
function pdt($tx,$tkn)
{
        // start curl
        $curlRequest = curl_init();
        // set curl options
        curl_setopt_array($request, array
        (
                // https://www.sandbox.paypal.com/cgi-bin/webscr if testing
                CURLOPT_URL => 'https://www.paypal.com/cgi-bin/webscr',
                CURLOPT_POST => TRUE,
                CURLOPT_POSTFIELDS => http_build_query(array
                (
                        'cmd' => '_notify-synch',
                        'tx' => $tx,
                        'at' => $tkn,
                )),
                CURLOPT_RETURNTRANSFER => TRUE,
                CURLOPT_HEADER => FALSE,
                // might have problems if this is true, false less secure
                CURLOPT_SSL_VERIFYPEER => FALSE,
                CURLOPT_CAINFO => 'cacert.pem',
        ));

        // get response, response code
        $curlResponse = curl_exec($curlRequest);
        $status   = curl_getinfo($curlRequest, CURLINFO_HTTP_CODE);
        // close connection
        curl_close($curlRequest);

        // check responses,
        // GOOD:
        // response codes: anything in the 2xx 200-206 (I think it only sends 200 on success)
        // starts with 'SUCCESS'
        if($status == 200 AND strpos($curlResponse, 'SUCCESS') === 0)
        {
                // get rid of success
                $curlResponse = substr($curlResponse, 7);
                // decode in case of special chars
                $curlResponse = urldecode($curlResponse);
                // make associative array
                preg_match_all('/^([^=\r\n]++)=(.*+)/m', $curlResponse, $m, PREG_PATTERN_ORDER);
                $curlResponse = array_combine($m[1], $m[2]);
                // keysort to keep in order
                ksort($curlResponse);
                return $curlResponse;
        }
        return 'error, response code ' . $status;
}
