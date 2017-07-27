<?php

// open db connection
$file = 'nations.json';
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



foreach($decode as $index=>$data){
  $country = $data['name'];
  $country_id = '';
  $datatype_id = '';

  // check if country exists
  $sql = "SELECT * FROM data_story_countries WHERE name='".$country."'";
  if (!$result = $conn->query($sql)) {
    printf("Errormessage: %s\n", $mysqli->error);
  }
  /* determine number of rows result set */
  $row_cnt = $result->num_rows;
  //  if country doesn't exist, add it
  if($row_cnt == 0){
    $sql = "INSERT INTO data_story_countries(name) VALUES('".$country."')";
    if (!$result = $conn->query($sql)) {
      printf("Errormessage: %s\n", $mysqli->error);
    }
  } else if($row_cnt > 1){
    print("Error: More than one id for country ".$country);
  } else if($row_cnt == 1){
      while ($row = $result->fetch_assoc()) {
          $country_id = $row["id"];
      }

  }


  // process population

  $var = 'population';
  $datatype_id = checkForDataType($var,$conn);
  // check for and add values
  foreach($data['population'] as $dt_index=>$dt_value){
    echo($country ." population for year ".$dt_value[0]." was ".$dt_value[1]."\r\n");
    $year = $dt_value[0];
    $value = $dt_value[1];
    checkForValue($datatype_id, $country_id, $year, $value,$conn);

      // check if exists

  }


  // process income
  $var = 'income';
  $datatype_id = checkForDataType($var,$conn);
  // check for and add values
  foreach($data['income'] as $dt_index=>$dt_value){
  echo($country ." income for year ".$dt_value[0]." was ".$dt_value[1]."\r\n");
  $year = $dt_value[0];
  $value = $dt_value[1];
  checkForValue($datatype_id, $country_id, $year, $value,$conn);




  }



 // process lifeExpectancy
 $var = 'lifeExpectancy';
 $datatype_id = checkForDataType($var,$conn);

 // check for and add values
  foreach($data[$var] as $dt_index=>$dt_value){
    echo($country ." ".$var." for year ".$dt_value[0]." was ".$dt_value[1]."\r\n");
    $year = $dt_value[0];
    $value = $dt_value[1];
    checkForValue($datatype_id, $country_id, $year, $value,$conn);

  }

}

$conn->close();


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
      printf("Errormessage: %s\n", $mysqli->error);
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
