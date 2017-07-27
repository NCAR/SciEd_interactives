<?php

// open db connection
$servername = "127.0.0.1";
$username = "root";
$password = "root";
$db = "scied_exhibits";

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// determine id for emissions
$datatype_id = 0;

$sql = "SELECT id FROM data_story_datatypes WHERE name='ghgEmissions'";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;
if($row_cnt == 1){
  while ($row = $result->fetch_assoc()) {
        $datatype_id = $row["id"];
  }
}


$sql = "SELECT dsdv.year as year, dsdv.value as value, dsc.name as country from data_story_data_values as dsdv, data_story_countries as dsc WHERE dsdv.datatype_id=".$datatype_id." AND dsc.id = dsdv.country_id AND dsc.name != 'World' ORDER BY country, year";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;

$a_json = null;
$index = null;
if($row_cnt > 0){
  $current_cnty = null;

  while ($row = $result->fetch_assoc()) {

    if($row['country'] != $current_cnty){
      $current_cnty = $row['country'];
      $a_json[] = ["name" => $row['country'], "emissions" => array(), "years" => array()];
      $index = count($a_json)-1;
    }

    $a_temp_emissions = [$row['year'],$row['value']];
    $a_temp_years = [$row['year'],$row['year']];
    $a_json[$index]['emissions'][] = $a_temp_emissions;
    $a_json[$index]['years'][] = $a_temp_years;
    //print "<p>".$row['country']." (".$row['year']."): ".$row['value']."</p>";
  }
}

echo json_encode($a_json, JSON_PRETTY_PRINT);




?>
