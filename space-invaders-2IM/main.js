const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RIGHT = 39;
const KEY_LEFT = 37;

// Skyte pew, pew
const KEY_SPACE = 32;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// nøkkelparametere i spillet 
const STATE = {
  x_pos : 0,
  y_pos : 0,
  move_right: false,
  move_left: false,
  shoot: false,
  lasers: [],
  enemyLasers: [],
  enemies : [],
  spaceship_width: 40,
  enemy_width: 40,
  // Cooldown hjelper for å skyte lasere med en gang når spillet starter
  cooldown : 0,
  number_of_enemies: 14,
  enemy_cooldown : 0,
  gameOver: false
}

// Putter bildet i spesefikk kordinater, generell funksjon
// Lett forklart dette fikser Haidar, (lol). nåår dusnakker om setposition kom hit 
function setPosition($element, x, y) {
  $element.style.transform = `translate(${x}px, ${y}px)`;
} 

function setSize($element, width) {
  $element.style.width = `${width}px`;
  //	The browser calculates the height. This is default
  $element.style.height = "auto";
}

// Detter gjør at Haidar ikke går ut av canvasen når den er på 0 
// hvis den er mere enn veggen bli på veggen
function bound(x){
  if (x >= GAME_WIDTH-STATE.spaceship_width){
    STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
    return GAME_WIDTH-STATE.spaceship_width
  } if (x <= 0){
    STATE.x_pos = 0;
    return 0
  } else {
    return x;
  }
}

// For å få de til å bevege seg. 
function collideRect(rect1, rect2){
  return!(rect2.left > rect1.right || 
    rect2.right < rect1.left || 
    rect2.top > rect1.bottom || 
    rect2.bottom < rect1.top);
}










// Player
function createPlayer($container) {
  STATE.x_pos = GAME_WIDTH / 2;
  STATE.y_pos = GAME_HEIGHT - 80;
  const $player = document.createElement("img");
  $player.src = "bilder/Haider.png";
  $player.className = "player";
  // legger til img i html  Appendchild legger til html
  $container.appendChild($player);
  setPosition($player, STATE.x_pos, STATE.y_pos);
  setSize($player, STATE.spaceship_width);
}

// Opptatere spilleren. 
function updatePlayer(){
  if(STATE.move_left){
    STATE.x_pos -= 8;
  } if(STATE.move_right){
    STATE.x_pos += 8;
    // Skyteren for player: som står for hvis vi preseer space bar så lager vi en laser
  } if(STATE.shoot && STATE.cooldown == 0){
    createLaser($container, STATE.x_pos - STATE.spaceship_width/2, STATE.y_pos);
       // Starter cooldown 
    STATE.cooldown = 10;
  }
 
  const $player = document.querySelector(".player");
  setPosition($player, bound(STATE.x_pos), STATE.y_pos-10);
    // Opptatere cooldown.
  if(STATE.cooldown > 0){
    STATE.cooldown -= 0.5;
  }
}

// Player Laser
function createLaser($container, x, y){
  const $laser = document.createElement("img");
  $laser.src = "bilder/laser.png";
  $laser.className = "laser";
   // legger til img i html  Appendchild legger til htm
  $container.appendChild($laser);
  const laser = {x, y, $laser};
  // legger til laser i laser lista, pushhhhh
  STATE.lasers.push(laser);
  setPosition($laser, x, y);
}

function updateLaser($container){
  const lasers = STATE.lasers;
  for(let i = 0; i < lasers.length; i++){
    const laser = lasers[i];
    laser.y -= 8;
    // Fjerne laserne
    if (laser.y < 0){
      deleteLaser(lasers, laser, laser.$laser);
    }
    
     // Den sjekker også når haidar skyter en laser og 
        // treffer fjenden, så avsjærer den med fjenden. 
        // Å hvis dette skjer så fjerner den lasern og spilleren :) 
  
    setPosition(laser.$laser, laser.x, laser.y);
        // Dette er en forloop som kjører funksjonen 
         
      //The getBoundingClientRect() method returns a DOMRect object with eight properties: left, top,     right, bottom, x, y, width, height.  
    const laser_rectangle = laser.$laser.getBoundingClientRect();
    const enemies = STATE.enemies;
    for(let j = 0; j < enemies.length; j++){
      const enemy = enemies[j];
      const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
      if(collideRect(enemy_rectangle, laser_rectangle)){
        deleteLaser(lasers, laser, laser.$laser);
        const index = enemies.indexOf(enemy);
        // index finner hivlket index enemy har i lista :)
        enemies.splice(index,1);
        // splice fjerner enemyen jeg fant fra lista
        $container.removeChild(enemy.$enemy);
        // Fjerner html/bildet litt som appendchild bare motsatt
      }
    }
  }
}









// Enemy 
function createEnemy($container, x, y, bilde){
  const $enemy = document.createElement("img");
  $enemy.src = bilde;
  // Remove this code and you will have fun
  $enemy.className = "enemy"; 
   // legger til img i html  Appendchild legger til htm
  $container.appendChild($enemy);
  const enemy_cooldown = Math.floor(Math.random()*100);
  const enemy = {x, y, $enemy, enemy_cooldown}
  STATE.enemies.push(enemy);
  setSize($enemy, STATE.enemy_width);
  setPosition($enemy, x, y)
} 

function updateEnemies($container){
  const dx = Math.sin(Date.now()/1000)*40;
  const dy = Math.cos(Date.now()/1000)*30;
  const enemies = STATE.enemies;
  for (let i = 0; i < enemies.length; i++){
    const enemy = enemies[i];
    var a = enemy.x + dx;
    var b = enemy.y + dy;
    setPosition(enemy.$enemy, a, b);
    enemy.cooldown = Math.random(0,100);
     // Randomizer når folka skyter
    if (enemy.enemy_cooldown == 0){
      createEnemyLaser($container, a, b, enemy.$enemy.src);
         // Math.floor runder til det laveste tallet
         // Math.random returnerer et tilfeldig tall mellom 0 (inkludert) og 1 (ekskludert): hahaha lol kan ikke få 1 bare 0.999999999999999 sikkert mer. 
      enemy.enemy_cooldown = Math.floor(Math.random()*50)+100 ;
    }
    enemy.enemy_cooldown -= 0.5;
  }
}


// Samme kode bare annerledes navn, som Enemy :). 
// Derfor bytter jeg navnet fra laser til enemy laser
function createEnemyLaser($container, x, y, imgSource){
  const $enemyLaser = document.createElement("img");
  $enemyLaser.src = "bilder/enemyLaser.png";
  $enemyLaser.className = "enemyLaser";
  $enemyLaser.alt = imgSource;
  $container.appendChild($enemyLaser);
  const enemyLaser = {x, y, $enemyLaser};
    // legger til laser i laser lista, pushhhhh
  STATE.enemyLasers.push(enemyLaser);
  setPosition($enemyLaser, x, y);
}
 
function updateEnemyLaser($container){
  const enemyLasers = STATE.enemyLasers;
  // Lager en for loop som går gjennom hele lista av laserne og det øker deres y-verdi 
  // Å når Y-verdig økes så går de nedover skjermen  
  // Vi er ikke ferdig nei.
  // Etter det så de beveger seg nedover skjermen
  // Etter det skal vi lage en if-setning som skal sjekke om laseren utafor spillet og hvis det er så sletter vi den. 
  //Nice 
  for(let i = 0; i < enemyLasers.length; i++){
    const enemyLaser = enemyLasers[i];
    // Hvor kjapt de kommer mot deg. 15 er farlig 
    enemyLaser.y += 9;
    if (enemyLaser.y > GAME_HEIGHT-30){
      deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
    }
     //The getBoundingClientRect() method returns a DOMRect object with eight properties: left, top,     right, bottom, x, y, width, height.
    const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
    const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
          // Hvis de colliderer så er det ferdig 
    if(!STATE.gameOver && collideRect(spaceship_rectangle, enemyLaser_rectangle)){
      // console.log(enemyLasers[i].$enemyLaser.alt);
      let kommentar = "";

       // Guttas roast mot haidar, noen violater Haidar kraftig ass. Ta deg en popkorn og les...
      switch(enemyLasers[i].$enemyLaser.alt) {
        case "http://127.0.0.1:5500/bilder/Amir.png":
          kommentar =  "Amir: Skaff deg tinder"
          break;
        case "http://127.0.0.1:5500/bilder/Kenan.png":
          kommentar = "Kenan: Atomer, Protoner og Nøytroner"
          break;
        case "http://127.0.0.1:5500/bilder/Ludvig.png":
          kommentar = "Ludvig: Get some bitches"
          break;
        case "http://127.0.0.1:5500/bilder/Elias.png":
          kommentar = "Elias: Er ikke du IT lærer?"
          break;
        case "http://127.0.0.1:5500/bilder/Hamza.png":
          kommentar = "Hamza: Fiks opp din style"
          break;
        case "http://127.0.0.1:5500/bilder/Ole.png":
          kommentar = "Ole: Kompis, jeg legger meg helt flat"
          break;
        case "http://127.0.0.1:5500/bilder/Serhat.png":
          kommentar = "Serhat: Sorry ass bestefar"
          break;
        case "http://127.0.0.1:5500/bilder/therese.png":
          kommentar = "Therese: Du tapte like hardt som du tapte hår"
          break;
        case "http://127.0.0.1:5500/bilder/Edvard.png":
          kommentar = "Edvard: Skaff deg hår taper"
          break;
        case "http://127.0.0.1:5500/bilder/Daniel.png":
          kommentar = "Daniel: Du er dårlig i drift"
          break;
        case "http://127.0.0.1:5500/bilder/Sturla.png":
          kommentar = "Sturla: Pannekaker"
          break;
        case "http://127.0.0.1:5500/bilder/Marcus.png":
            kommentar = "Marcus: Baldy"
            break;
        case "http://127.0.0.1:5500/bilder/Alex.png":
          kommentar = "Alex: Du tror livet er herlig"
          break;
        case "http://127.0.0.1:5500/bilder/Nico.png":
          kommentar = "Nico: Det som ikke dreper deg gjør deg sterkere"
          break;
        case "http://127.0.0.1:5500/bilder/Torstein.png":
          kommentar = "Torstein: ..........."
          break;
      }

      document.getElementById("losing_text").innerText = kommentar;
      STATE.gameOver = true;
    }// den opptaderer posisjonen 
    setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y+15);
  }
}


// Delete Laser
function deleteLaser(lasers, laser, $laser){
  const index = lasers.indexOf(laser);
  lasers.splice(index,1);
  
  let laserIsInList = false;
  for (let i = 0; i < $container.childNodes.length; i++){
  if ($container.childNodes[i] == $laser) {
      laserIsInList = true;
    break;
    }
 }
  if (laserIsInList) {
    $container.removeChild($laser);
   }
}







// Key Presses 
// Denne koden er veldig viktig, fordi den foteller koden å bevege seg.
function KeyPress(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = true;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = true;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = true;
  }
}
// Dette gjør at den den slutter å bevege seg når du ikke holder på knappen som er litt kult ut
// Du kan gjøre det heftig, dobbelt
function KeyRelease(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = false;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = false;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = false;
  }
}

// Main Update Function
// For å la haidar bevege seg
function update(){
  if (STATE.gameOver == false) {
    updatePlayer();
    updateEnemies($container);
    updateLaser($container);
    updateEnemyLaser($container);

  // Når den refresher, så updater den function update
  window.requestAnimationFrame(update);
  
  // Disse 2 iffene hjlper oss med å vise at du har tapt eller ikke 
  // Dette funker fjendene/spilleren er dø
  }
  else {
    document.querySelector(".lose").style.display = "block";
  } if (STATE.enemies.length == 0) {
    document.querySelector(".win").style.display = "block";
  }
}

let bildeListe = ["bilder/Amir.png", "bilder/Kenan.png", "bilder/Ludvig.png", "bilder/Elias.png", "bilder/Hamza.png", "bilder/Ole.png", "bilder/Serhat.png", "bilder/therese.png", "bilder/Edvard.png", "bilder/Daniel.png", "bilder/Sturla.png", "bilder/Marcus.png", "bilder/Alex.png", "bilder/Nico.png", "bilder/Torstein.png"];


// Hjelper oss med å lage 2 rader med Fiender
function createEnemies($container) {
  for (var i = 0; i <= STATE.number_of_enemies/2; i++){
    createEnemy($container, i*80 + 65, 100, bildeListe[i]);
  } 
  for (var i = 0; i <= STATE.number_of_enemies/2; i++){
    createEnemy($container, i*80 + 65, 180, bildeListe[i + 7]);
  }
}

// Start spillet
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);

// Key Press Event Listener sjekker at keypressene
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);
 
update();