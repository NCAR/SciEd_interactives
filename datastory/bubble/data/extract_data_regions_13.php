<?php

/*
From the world climate game
US:
EU: Austria, Belgium, Bulgaria, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxemburg, Malta, the Netherlands, Poland, Portugal, Romania, Slovakia, Spain, Sweden and the United Kingdom, Iceland, Norway and Switzerland
Other Developed: Developed nations, other than the US and EU members. This includes Australia, Canada, Japan, New Zealand, Russia, South Korea, and other former Soviet Republics and eastern European countries.
China:
India:
Other Developing: Developing nations, other than China and India. This includes the nations of Africa, Central and South America, South and Southeast Asia, most of the Middle East, and the small island nations.
*/


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

$sql = "SELECT dsdv.year as year, dsdv.value as value, dsdv.datatype_id as data_id, dsd.name as data_name, dsdv.country_id as country_id, dsc.name as country_name, dsc.region as region from data_story_data_values as dsdv, data_story_countries as dsc, data_story_datatypes as dsd WHERE dsdv.datatype_id=dsd.id AND dsdv.country_id=dsc.id AND dsdv.year >= '1970' AND dsc.name != 'World' ORDER BY year";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;
$a_countries = array();

$a_data = array();
if($row_cnt > 0){
  while ($row = $result->fetch_assoc()) {

    if(!array_key_exists($row['country_name'],$a_countries)){
      $a_countries[$row['country_name']] = array("name"=> $row['country_name'], "region"=>$row['region'], "ghgEmissions"=> array(), "population"=>array(), "income" => array(), "lifeExpectancy" => array());
    }
    $a_countries[$row['country_name']][$row['data_name']][] = array((int)$row['year'],(float)$row['value']);


  }
}

$a_final_data = array();

foreach($a_countries as $index=>$data){
  $a_final_data[] = $data;
}

echo json_encode($a_final_data, JSON_PRETTY_PRINT);
?>
