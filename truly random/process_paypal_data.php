<?php

header('Content-Type: text/html; charset=utf-8');

/**
 * Takes the payment data gotten from process_pdt_function.php's function
 * checks the transaction details and gives a code based on several things:
 * [receiver_email] => the seller's email
 * [payment_gross] => the amount paid
 * [mc_currency] => the type of currency (USD)
 * [item_name] => the item name (Chinese Hack Code, English Hack Code)
 * @param $data     the array returned from the pdt function
 * @param $mysql    the mysql connection
 * @return          the code or invalid transaction ID message
 */

function id_to_code($data, $mysql)
{
	
	//check payment reciever's emails
	if($data[receiver_email] !== "hi@qq.com" && $data[receiver_email] !== "h2i@qq.com")
	{
		return "Looks like you paid the wrong person...";
	}
	
	//check currency type
	if($data[mc_currency] !== "USD")
	{
		return "We like USD. Pay in USD.";
	}
	
	//set timezone to pdt
	date_default_timezone_set('America/Vancouver');
	
	//today's date
	$month = jdmonthname(gregoriantojd(date(m),13,1998),0);
	$this_date = jdmonthname($jd,0) . " " . date(Y) . " PDT";
	
	//date of purchase
	$payment_date = $data[payment_date];
	$payment_date1 = substr($payment_date, -9);
	$payment_date2 = substr($payment_date, 9, 3);
	
	/*check time of purchase
	if ( strcmp($this_date, $payment_date2 . $payment_date1) !== 0)
	{
		return "You're a little late on redeeming...";
	}
	*/
	
	//check kind of item
	if ($data[item_name] == "somethin")
	{
		$db = mysql_select_db("somethin", $mysql);
	}
	else if ($data[item_name] == "somethin2")
	{
		$db = mysql_select_db("somethin2", $mysql);
	}
	else
	{
		return "We're not sure what you bought...";
	}
	
	
	//check amount paid
	if ($data[payment_gross] == 20.00) 
	{
		$table = "20";
	}
	else if ($data[payment_gross] == 7.00) 
	{
		$table = "7";
	}
	else if ($data[payment_gross] == 2.00)
	{
		$table = "2";
	}
	else
	{
		return "You paid an incorrect amount...";
	}
	
	//look around table for code that has matching transaction ID
	$result = mysql_query( "SELECT * FROM `$table` WHERE `id` LIKE '$data[txn_id]' LIMIT 1" );
	
	//if there is none found, make a new entry
	if( mysql_num_rows($result) == 0 ) 
	{ 
	mysql_query("UPDATE `$table` SET id='$data[txn_id]',date='$data[payment_date]',ip='$ip' WHERE `id` LIKE '' LIMIT 1");
	$result = mysql_query( "SELECT * FROM `$table` WHERE `id` LIKE '$data[txn_id]' LIMIT 1" );
	}
	
	//get the row that the transaction ID is found on and return the cod value
	$row = mysql_fetch_array($result);	
	return $row['cod'];
}
?>
