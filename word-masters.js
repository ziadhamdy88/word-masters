const ANSWER_LENGTH = 5;
const ROUNDS = 6;

const letters = document.querySelectorAll(".guess-letter");
const loadingDiv = document.querySelector(".load");


async function init() {
  let currentRow = 0;
  let currentGuess = "";
  let isLoading = true;
  let done = false;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const {word: wordResponse} = await res.json();
  const word = wordResponse.toUpperCase();
  const wordArray = word.split("");
  isLoading = false;
  setLoading(isLoading);

  document.addEventListener("keydown", function handleKeyPress(event) {
    if(done || isLoading){
      return;
    }
    const key = event.key;

    if (key === 'Enter'){
      submit();
    }else if (key === 'Backspace'){
      remove();
    } else if (isLetter(key)){
      addLetter(key.toUpperCase());
    }
  });

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH){
      currentGuess += letter;
    }
    else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter; 
    }
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
  }

  async function submit(){
    if (currentGuess.length !== ANSWER_LENGTH){
      return;
    }

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess })
    });

    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);
    
    if (!validWord){
      markInvalidWord();
      return;
    }

    const guessArray = currentGuess.split("");
    const map = countLetters(wordArray);
    let allCorrect = true;

    for (let i=0; i<ANSWER_LENGTH; i++){
      if(guessArray[i] === wordArray[i]){
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessArray[i]]--;
      }
    }

    for(let i=0; i<ANSWER_LENGTH; i++){
      if (guessArray[i] === wordArray[i]){
        continue;
      } else if (map[guessArray[i]] && map[guessArray[i]] > 0) {
        allCorrect = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessArray[i]]--;
      } else {
        allCorrect = false;
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    currentGuess = "";

    if (allCorrect) {
      alert("YOU WIN!!!");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      alert(`You lose, the word was ${word.toLowerCase()}`);
      done = true;
    }

  }

  function remove() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    for (let i=0; i<ANSWER_LENGTH; i++){
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"), 10);
    }
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function countLetters(array) {
  const obj = {};
  for (let i=0; i<array.length; i++){
    if (obj[array[i]]){
      obj[array[i]]++;
    } else{
      obj[array[i]] = 1;
    }
  }
  return obj;
}
init();