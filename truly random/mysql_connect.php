<?php
/**
 * creates a mysql connection
 * @param $servername
 * @param $username
 * @param $password
 * @return the connection to mysql
 * @return false if the connection doesn't exist
 */
 
function connect_mysql($servername, $username, $password)
{

	//create connection to mysql database
	$conn = mysql_connect($servername, $username, $password);

	//check connection
	if (!$conn) {
		return FALSE;
	}
	
	return $conn;
}

?>
