<?php
/**
 * gets all the files in a directory
 * @param $directory    the directory to scan
 * @param $dl           i actually don't know?????? sorry been a while lol
 * @return              a list of html div elements (class=fileicon) 
 * @return              "There are no files in directory" if no files are in directory
 */
function get_file($directory, $dl){
	$files_list = "";
	$dir   = $directory; // the directory you want to check
	$exclude = array(".", ".."); // you don't want these entries in your files array
	$files = scandir($dir);
	$files = array_diff($files, $exclude); // delete the entries in exclude array from your files array
	if(!empty($files) and $dl) // check if the files array is not empty
	{
		foreach ($files as $file) // print every file in the files array
			$files_list .= "<div class='fileicon'>
		<a href='$directory/$file' download>
		<p class='filetext'>$file</p>
		</a>
		</div>";
	}
	else if(!empty($files)){
			foreach ($files as $file) // print every file in the files array
			$files_list .= " <div class='fileicon'>
	<a href='$directory$file'>
	<p class='filetext'>$file</p>
	</a>
	</div>";
	}
	else 
	{
		$files_list .= "There are no files in directory"; // print error message if there are no files
	}

	return $files_list;
}
?>
