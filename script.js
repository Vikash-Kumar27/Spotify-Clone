console.log("Script is loading");

let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSecond(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid Input"
    }


    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formateedSeconds = String(remainingSeconds).padStart(2, '0');


    return `${formattedMinutes}:${formateedSeconds}`

}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();


    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")


    songs = [];

    for (let i = 0; i < as.length; i++) {
        let element = as[i]
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (let song of songs) {

        songUl.innerHTML += `<li><img class ="invert" src="img/music.svg" alt="">
          <div class="info">
              <div>${song.replaceAll("%20", " ").split(".")[0].split("-")[0]}</div>
              <div>-${song.replaceAll("%20", " ").split(".")[0].split("-")[1]}</div>
          </div>
          <div class="playnow flex justify-center item-center">
              <span>play now</span>
              <img class="invert" src="img/playnow.svg" alt="">
          </div>
          </li>`;
    }

    // Attach an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").innerText.trim());

        })
    })

    return songs;
};

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+ track +".mp3" )

    track = track.split(".")[0]

    currentSong.src = `/${currFolder}/` + track + ".mp3"


    if (!pause) {
        play.src = "img/pause.svg"
        currentSong.play();
    }

    document.querySelector(".songInfo").innerHTML = track.replaceAll("%20", " ")
    document.querySelector(".songTiming").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {

    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();

    const cardContainer = document.querySelector(".container-cards")

    let div = document.createElement("div");
    div.innerHTML = response;
    let anker = div.getElementsByTagName("a")
    let array = Array.from(anker);
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        if (e.href.includes("songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();


            cardContainer.innerHTML += `<div data-Folder="${folder}" class="card rounded">
        <div class="playCircle">
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24">
                <!-- Circular green background without border -->
                <circle cx="12" cy="12" r="10" fill="#1ed760" />

                <!-- Play icon in black color -->
                <path d="M9.5 16V8L16 12L9.5 16Z" fill="black" />
            </svg>
        </div>
        <img src="songs/${folder}/cover.jpg" alt="image">
        <h3>${response.title}</h3>
        <p>${response.description}</p>
    </div>`

        }
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])

        })
    })

}

(async () => {
    // Get the list of all the songs 
    await getSongs("songs/mood");
    playMusic(songs[0], true)

    // Display all the album in the page
    displayAlbum()

    //Attach an event listener to play,next and previous

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    //  Attch add timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTiming").innerHTML = `${secondsToMinutesSecond(currentSong.currentTime)}/${secondsToMinutesSecond(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // add an event listner in seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // add an event on hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // add an event on cross
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%";
    })

    //add an event on previous  
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an event on  next
    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event on volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

   // add an event to mute the track
   document.querySelector(".volume > img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
        e.target.src = "img/mute.svg";
        document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        currentSong.volume= 0
        
    }
    else{
        e.target.src = "img/volume.svg"
        document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        currentSong.volume = .1; 
    }
   })



})();