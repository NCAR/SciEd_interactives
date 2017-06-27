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

// extract all of the regions
$a_china = array();
$a_regions = array();
$a_regions_emissions = array();
$sql = "SELECT id, name, region FROM data_story_countries WHERE nametype != 'world' ORDER BY region, name";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;
if($row_cnt > 0){
    while ($row = $result->fetch_assoc()) {
      // force that china is one unit not China, Macao, and Hong Kong as separate
      if($row['region'] == 'China'){
        $a_china[] = $row['id'];
      }
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

$sql = "SELECT dsdv.year as year, dsdv.value as value, dsc.id as country_id, dsc.name as country_name from data_story_data_values as dsdv, data_story_countries as dsc WHERE dsdv.datatype_id=".$datatype_id." AND dsc.id=dsdv.country_id ORDER BY dsc.name,year";
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
          // this country is in this region
          $value = $row['value'];
          $country_name = $row['country_name'];

          // special case handling for China
          if($region_name == 'China'){
              $country_name = 'China';
          }

          // this regions is already empty or this country isn't in it, so add this country brand new
          if(count($a_regions_emissions[$region_name ]) == 0 || !isset($a_regions_emissions[$region_name ][$country_name])){
                $a_regions_emissions[$region_name ][$country_name] = $row['value'];
          } else if(isset($a_regions_emissions[$region_name ][$country_name]) ){
            // we found this country so add to the value
            if($row['value'] != 0){
              $a_regions_emissions[$region_name ][$country_name] += $row['value'];
            }
          }
    }
  }
}
}


$a_json = array();
$a_completed_data = array();
$a_data = array();
$a_data_order = array("United States","China","India","European Union","Other Developed","Other Developing");

foreach($a_regions_emissions as $index=>$data){
    $a_children = array();
    foreach($data as $index_children=>$data_children){
      // only include if > 0
      if((int)$data_children > 0){
        $a_children[] = array("name" =>$index_children, "ID" =>$index_children, "size"=>(int)$data_children);
      }
    }
    $a_data[$index] = $a_children;
}
foreach($a_data_order as $index=>$name){
  $a_completed_data[] = array("name" => $name,"children" => $a_data[$name]);
}



$a_json = array("name"=>"regions", "children"=> $a_completed_data);
echo json_encode($a_json, JSON_PRETTY_PRINT);




?>
