<?php

// open db connection
$file = 'emissions.json';
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
echo "Connected successfully\r\n";

$str = file_get_contents($file);
$decode = json_decode($str, true);

$a_orphan = array();

// make sure emissions is a data tidy_parse_file
$var = 'emissions';
$datatype_id = checkForDataType($var,$conn);

foreach($decode as $index=>$data){

  echo '<pre>';
  foreach($data['data']['record'] as $rec_index=>$rec_val){

      $country = '';
      $country_id = '';
      $year = null;
      $value = 0;
      $a_pending_cnt = array('name'=>'','year'=>'', 'value'=>'');

    foreach($rec_val['field'] as $data_index=>$data_val){
      if($data_val['-name'] == 'Country or Area'){
          $country = $data_val['#text'];
      }

      if($data_val['-name'] == 'Year' && isset($data_val['#text'])){
          $year = $data_val['#text'];
      }

      if($data_val['-name'] == 'Value' && isset($data_val['#text'])){
          $value = $data_val['#text'];
      }

      // rename special case countries to match existing data
      if($country == 'Brunei Darussalam'){
        $country = 'Brunei';
      } else if($country == 'Hong Kong SAR, China'){
        $country = 'Hong Kong, China';
      } else if($country == 'Macao SAR, China'){
        $country = 'Macao, China';
      } else if($country == 'Korea, Dem. People’s Rep.'){
        $country = 'Korea, Dem. Rep.';
      }


      // check if country exists
      $sql = "SELECT * FROM data_story_countries WHERE name='".addslashes($country)."'";
      if (!$result = $conn->query($sql)) {
        printf("Errormessage: %s\n", $conn->error);
      }
      /* determine number of rows result set */
      $row_cnt = $result->num_rows;
      //  if country doesn't exist, add it
      if($row_cnt == 0){
        $sql = "INSERT INTO data_story_countries(name) VALUES('".addslashes($country)."')";
        if (!$result = $conn->query($sql)) {
          printf("Errormessage: %s\n", $mysqli->error);
        }
        //$a_pending_cnt['name']=$country;
      } else if($row_cnt > 1){
        print("Error: More than one id for country ".$country);
      } else if($row_cnt == 1){
          while ($row = $result->fetch_assoc()) {
              $country_id = $row["id"];
          }

      }




    }
    // process emissions
    // check for and add values
      if(empty($a_pending_cnt['name'])){
        // this is not a new country, so proceed as normal
         echo($country ." ".$var." for year ".$year." was ".$value."\r\n");
        checkForValue($datatype_id, $country_id, $year, $value, $conn);
      } else {
        // this country doesn't exist in the db, so save it for manual report
        $a_pending_cnt['year']=$year;
        $a_pending_cnt['value']=$value;
        $a_orphan[] = $a_pending_cnt;
      }

  }


}

$conn->close();
/*
echo '<pre>';
var_dump($a_orphan);
echo '</pre>';
*/

function checkForDataType($var,$conn){

  $sql = "SELECT * FROM data_story_datatypes WHERE name='".$var."'";
  if (!$result = $conn->query($sql)) {
    printf("Errormessage: %s\n", $conn->error);
  }
  /* determine number of rows result set */
  $row_cnt = $result->num_rows;
  //  if datatype doesn't exist, add it
  if($row_cnt == 0){
    $sql2 = "INSERT INTO data_story_datatypes(name) VALUES('".$var."')";
    if (!$result2 = $conn->query($sql2)) {
      printf("Errormessage: %s\n", $conn->error);
    }
  } else if($row_cnt > 1){
    print("Error: More than one id for datatype ".$var);
  } else if($row_cnt == 1){
      while ($row = $result->fetch_assoc()) {
            return $row["id"];
      }
  }

  return false;
}

function checkForValue($datatype_id, $country_id, $year, $value,$conn){
  $sql = "SELECT * FROM data_story_data_values WHERE country_id='".$country_id."'AND datatype_id='".$datatype_id."' AND year='".$year."' AND value='".$value."'";

  if (!$result = $conn->query($sql)) {
    printf("Errormessage: %s\n", $conn->error);
  }
  /* determine number of rows result set */
  $row_cnt = $result->num_rows;
  //  if datatype doesn't exist, add it
  if($row_cnt == 0){
    $sql2 = "INSERT INTO data_story_data_values(country_id,datatype_id,year,value) VALUES('".$country_id."','".$datatype_id."','".$year."','".$value."')";
    if (!$result2 = $conn->query($sql2)) {
      printf("Errormessage: %s\n", $conn->error);
    }
    
  } else if($row_cnt > 1){

  }
}



?>
