<?php

    ini_set("display_errors","1");
    ERROR_REPORTING(E_ALL);

    function StartsWith($Haystack, $Needle) {
        return strpos($Haystack, $Needle) === 0;
    }

    if ($_SERVER['REQUEST_METHOD'] == "GET") {

        $participant = $_GET["p"];
        $session = $_GET["s"];
        $gist = $_GET["g"];

        if ($participant == NULL || $session == NULL || $gist == NULL) {
            header('HTTP/1.0 400 Bad Request');
            print("<h1>400 Bad Request</h1>");
            exit(0);
        }

        $filename = sprintf("data/%s-%s.json", $session, $participant);
        if ( ! file_exists($filename)) {

            $url = "https://public.opencpu.org/ocpu/cran/devtools/R/source_gist/json";
            $data = "id='" . $gist . "'";

            $options = array(
                'http' => array(
                    'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method' => "POST",
                    'content' => $data
                )
            );

            $context = stream_context_create($options);
            $result = file_get_contents($url, false, $context);

            if ($result == FALSE) {
                header('HTTP/1.0 500 Internal Error');
                print("<h1>500 Internal error</h1>");
                print("<p>Could not find execute gist</p>");
                exit(0);
            }

            $value = json_decode($result, true)["value"][0];
            header('Content-Type: application/json');
            echo($value);
        }
        else {
            header('Content-Type: application/json');
            readfile($filename);
        }

    }
    else if ($_SERVER['REQUEST_METHOD'] == "POST") {

        $participant = $_POST["p"];
        $session = $_POST["s"];
        $data = $_POST["d"];

        if ($participant == NULL || $session == NULL || $data == null) {
            header('HTTP/1.0 400 Bad Request');
            print("<h1>400 Bad Request</h1>");
            exit(0);
        }

        $filename = sprintf("data/%s-%s.json", $session, $participant);
        #if ( ! file_exists($filename)) {
        #    header('HTTP/1.0 404 Not Found');
        #    print("<h1>404 Not Found</h1>");
        #    exit(0);
        #}

        $handle = fopen($filename, "w");

        if ($handle == false) {
            header('HTTP/1.0 500 Server Error');
            print("<h1>500 Server Error</h1>");
            print("<p>Could not open " . $filename . "</p>");
            $lastError = error_get_last();
            print($lastError["message"]);
            exit(0);
        }

        if (flock($handle, LOCK_EX)) {

            fwrite($handle, $data);
            flock($handle, LOCK_UN);
        }

        fclose($handle);

        header('HTTP/1.0 204 No Content');

    }


?>
