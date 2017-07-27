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


// extract all of the countries
$a_regions = array();
$a_regions_emissions = array();
$sql = "SELECT id, name, region FROM data_story_countries WHERE nametype != 'world'";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;
if($row_cnt > 0){
    while ($row = $result->fetch_assoc()) {

      if(!array_key_exists($row['region'],$a_regions)){
        $a_regions[$row['region']] = array();
      }
        $a_regions[$row['region']][] = $row['id'];
    }
}

$a_regions_emissions = $a_regions;
foreach($a_regions_emissions as $index=>$value){
  $a_regions_emissions[$index] = array();
}

//sort countries into the regions mentioned above
$a_years = array();

$sql = "SELECT dsdv.year as year, dsdv.value as value, dsdv.country_id as country_id from data_story_data_values as dsdv WHERE dsdv.datatype_id=".$datatype_id." ORDER BY year";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;

$a_json = null;
if($row_cnt > 0){
  while ($row = $result->fetch_assoc()) {
    // seek in regions
    foreach($a_regions as $region_name => $a_region_ids){
      if(in_array($row['country_id'],$a_region_ids)){
          $value = $row['value'];
          // if the size of array is 0 then add the year brand New

          if(count($a_regions_emissions[$region_name ]) == 0){
              $a_tmp = array((int)$row['year'],$row['value']);
              $a_regions_emissions[$region_name ][] = $a_tmp;
          } else {
              // check if this year exists already in this region's emissions
              $flag_year_found = false;
              foreach($a_regions_emissions[$region_name] as $subsection_index=>$subsection_detail){
                if($subsection_detail[0] == (int)$row['year']){
                  $flag_year_found = true;
                  $a_regions_emissions[$region_name][$subsection_index][1] = $a_regions_emissions[$region_name][$subsection_index][1] + $row['value'];
                }
              }

              if($flag_year_found == false){
                  // add as new year
                    $a_tmp = array((int)$row['year'],$row['value']);
                    $a_regions_emissions[$region_name ][] = $a_tmp;
              }

              if(!in_array($row['year'],$a_years)){
                $a_years[] = $row['year'];
              }

        }
    }
  }
}
}
$a_json = array();
$a_final_year = array();
foreach($a_years as $y_index=>$y_value){
  $a_tmp = array($y_value,$y_value);
  $a_final_year[] = $a_tmp;
}

foreach($a_regions_emissions as $index=>$data){
  $a_json[] = array("name"=>$index, "emissions"=>$data, "years" => $a_final_year);

}

echo json_encode($a_json, JSON_PRETTY_PRINT);




?>
