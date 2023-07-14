const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializationServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http:localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializationServerAndDB();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1 GET Method
app.get("/players/", async (request, response) => {
  const getAllPlayerDetails = `
    SELECT
    * 
    FROM 
    cricket_team;`;
  const playerDetails = await db.all(getAllPlayerDetails);
  response.send(
    playerDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// API2 POST Method
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO
    cricket_team (player_name,jersey_number, role)
    VALUES 
    (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );`;

  let dbResponse = await db.run(addPlayerQuery);
  let playerId = dbResponse.lastId;
  response.send("Player Added to Team");
});

// API 3 GET Method
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDet = `
    SELECT
    * 
    FROM cricket_team
    WHERE player_id = '${playerId}';
    `;
  let detailsOfPlayer = await db.get(getPlayerDet);
  response.send(convertDbObjectToResponseObject(detailsOfPlayer));
});

// API 4 PUT Method
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const putPlayerDet = `
    UPDATE 
    cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}';
    WHERE player_id = '${playerId}';
    `;
  await db.run(putPlayerDet);
  response.send("Player Details Updated");
});

// API 5 DELETE Method

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDet = `
    DELETE 
    FROM 
    cricket_team
    WHERE 
        player_id = '${playerId}';
    `;

  await db.run(deletePlayerDet);
  response.send("Player Removed");
});

module.exports = app;
