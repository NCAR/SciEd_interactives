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
$a_years = array();
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

$sql = "SELECT dsdv.year as year, dsdv.value as value, dsc.id as country_id, dsc.name as country_name from data_story_data_values as dsdv, data_story_countries as dsc WHERE dsdv.year >= '1970' AND dsdv.year <= 2012 AND dsdv.datatype_id=".$datatype_id." AND dsc.id=dsdv.country_id ORDER BY dsc.name,year";
if (!$result = $conn->query($sql)) {
  printf("Errormessage: %s\n", $conn->error);
}
/* determine number of rows result set */
$row_cnt = $result->num_rows;

$a_json = null;
if($row_cnt > 0){
  while ($row = $result->fetch_assoc()) {

    if(!in_array($row['year'],$a_years)){
      $a_years[$row['year']] = array();
    }

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
                $a_regions_emissions[$region_name ][$country_name] = array();
          }
          $a_regions_emissions[$region_name ][$country_name][$row['year']] = $row['value'];
    }
  }
}
}


$a_json = array();
$a_completed_data = array();
$a_data = array();
$a_data_order = array("United States","China","India","European Union","Other Developed","Other Developing");

foreach($a_regions_emissions as $region=>$data_region){
    foreach($data_region as $country=>$data_country){

        foreach($data_country as $year=>$size){
           // ensure region exists
           if(!array_key_exists($region,$a_years[$year])){
             $a_years[$year][$region] = array();
           }

            $a_years[$year][$region]['children'][] = array("name" =>$country, "ID" =>$country, "size"=>(int)$size);
        }


    }
}
  $a_completed_data = array();

foreach($a_years as $year=>$year_data){


/*  foreach($a_data_order as $index=>$name){
    $a_completed_data[] = array("name" => $name,"children" => $a_data[$name]);
  }
  */
  //$a_completed_year_data[] = array("name"=>$year, 'children'=>$a_completed_data);
  $a_region_children = array();
  foreach($year_data as $region=>$region_data){
     $a_region_children[] = array("name" => $region, "children"=>$region_data['children']);
  }

  $a_completed_data[] = array("name" => $year, "children"=>$a_region_children);
}



$a_json = array("name"=>"years", "children"=> $a_completed_data);
echo json_encode($a_json, JSON_PRETTY_PRINT);




?>
