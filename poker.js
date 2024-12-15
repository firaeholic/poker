let playerCount = 0;
let betAmount = 2000;
let totalTable = 0;
let allPlayers = [];
let raised = false;
let turn = 1;
let initialTotal = 50000;
let playersTotal = [];
let playerCards = [];
let foldedPlayers = [];
let brokePlayers = [];
let allInPlayers = [];
let whoRaised = 0;
let round = 0;
let gameEnded = false;
let bots = false;
let allCalled = false;
let calledPlayers = [];
let starterPlayer = 1;
let turns = 1;
cardNum = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
cardSuit = ["♠", "♣", "♥", "♦"];
const handRanks = {
    "Royal Flush": 10,
    "Straight Flush": 9,
    "Four of a Kind": 8,
    "Full House": 7,
    "Flush": 6,
    "Straight": 5,
    "Three of a Kind": 4,
    "Two Pair": 3,
    "One Pair": 2,
    "High Card": 1
};

function botGame(){
    bots = true
    document.getElementById("addPlayerBtn").innerHTML = "Add Bot";
    initiateGame();
}

function playerGame(){
    bots = false
    initiateGame();
}

function initiateGame(){
    document.getElementById("addPlayerBtn").style.display = "block";
    document.getElementById("dealBtn").style.display = "block";
    document.querySelector(".btnCon").style.display = "none";
    document.getElementById("option-play").style.display = "none";
}

function addPlayer(){
    playerCount++;
    allPlayers.push(playerCount);
    playersTotal.push({player: playerCount, total: initialTotal});
    document.getElementById("total-players").innerHTML = playerCount;
    const playersContainer = document.querySelector(".players");
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("player");
    playerDiv.id = `player-${playerCount}`;
    playerDiv.innerHTML = `
        <span id="tag-${playerCount}">Player ${playerCount} - </span>
        <span id="total-${playerCount}"></span>
        <div class="cards">Cards</div>
        <button onclick="fold(${playerCount})" class="actionBtn-${playerCount}" id="foldBtn-${playerCount}">Fold</button>
        <button onclick="check(${playerCount})" class="actionBtn-${playerCount}" id="callBtn-${playerCount}">Call</button>
        <button onclick="promptRaise(${playerCount})" class="actionBtn-${playerCount}" id="raisePrmt-${playerCount}">Raise</button>
        <br>
        <div class="raiseCtn-${playerCount}" style="display: none;">
            <label class="raise-lbl" for="raiseAmt-${playerCount}">Raise amount: </label>
            <input class="raise-inp" "type="number" id="raiseAmt-${playerCount}" name="raiseAmt">
            <button id="raiseBtn" onclick="raise(${playerCount})">Raise</button>
        </div>
        <div class="status-${playerCount}">Status: Playing</div>
    `;
    playersContainer.appendChild(playerDiv);
}

function checkTurn(pl){
    if (calledPlayers.length == playerCount){
        allCalled = true;
        checkCallText(pl, false);
        calledPlayers = [];
    }
    const player = playersTotal.find(player => player.player === pl);
    if(whoRaised != 0){
        turns++;
    }
    if(pl > 1){
        lastPl = pl - 1
        let raiseCtn = document.querySelector(".raiseCtn-" + lastPl);
        raiseCtn.style.display = "none";
        let prevPlayer = document.getElementById("tag-" + lastPl);
        prevPlayer.style.color = "black";
    }
    if (allInPlayers.length == playerCount || allInPlayers.length == playerCount - 1){
        pl = 1;
        if (round == 5){
            return;
        }
        setTimeout(() => {
            addOneCard();
            checkTurn(pl);
        }, 1500);
    }
    if (foldedPlayers.includes(pl)){
        pl++;
        turn++;
        turns++;
        checkTurn(pl); // if that person folded, skip them
        return
    }
    if (pl > playerCount){
        pl = 1;
        turn = 1;
        checkTurn(pl);
    }
    if (turns > playerCount && whoRaised == 0){
        pl = starterPlayer;
        turn = starterPlayer;
        turns = 1;
        if (whoRaised == 0){
            betAmount = 2000;
            document.getElementById("bet-amt").innerHTML = betAmount;
        }
        addOneCard(); // add new card to table and turn to next round
        checkTurn(pl);
        return
    }
    if(player.total == 0 && !allInPlayers.includes(pl) && round != 0){
        allInPlayers.push(pl);
        document.querySelector(`.status-${pl}`).innerHTML = "Status: All In";
        pl++;
        turn++;
        checkTurn(pl); // if that person has 0, he's all in
        return
    }
    let currentPlayer = document.getElementById("tag-" + pl);
    currentPlayer.style.color = "blue";
    if (whoRaised == pl){
        checkCallText(pl, false); // change text back to check
        whoRaised = 0;
        turns = 1;
        pl = starterPlayer;
        turn = starterPlayer;
        addOneCard();
        betAmount = 2000;
        document.getElementById("bet-amt").innerHTML = betAmount;
    }
    if (pl != 1 && bots){
        automateBot(pl);
    }
    return
}

function automateBot(player) {
    const combos = playerCards.map(playerCard => combination(playerCard));
    const botCombo = combos.find(combo => combo.player === player);
    const handRank = handRanks[botCombo.hand];
    const statusElement = document.querySelector(`.status-${player}`);
    let delay = Math.floor(Math.random() * 3000) + 2000;
    let riskLevel = Math.random();

    console.log("who raised", whoRaised)

    statusElement.textContent = "Thinking...";
    setTimeout(() => {
        statusElement.textContent = "Status: Playing";
        console.log(`Round: ${(round+1)}, Player: ${player}, Hand rank: ${handRank}, Risk level: ${riskLevel}`);
        if (round === 0) {
            if (handRank === 3) {
                executeRaise(player, Math.random() * 5000 + 3000);
            } else if (handRank === 2) {
                if (riskLevel > 0.3) {
                    executeRaise(player, Math.random() * 3000 + 1000);
                } else {
                    check(player);
                }
            } else {
                if (riskLevel > 0.4) {
                    check(player);
                } else {
                    fold(player);
                }
            }
        } else if (round === 1) {
            if (handRank === 8) {
                executeAllIn(player);
            } else if (handRank >= 4) {
                if (riskLevel > 0.2) {
                    executeRaise(player, Math.random() * 4000 + 2000);
                } else {
                    check(player);
                }
            } else if (handRank === 2) {
                if (riskLevel > 0.5) {
                    check(player);
                } else {
                    fold(player);
                }
            } else {
                if (riskLevel > 0.6 && whoRaised != 0) {
                    fold(player);
                } else {
                    check(player);
                }
            }
        } else if (round === 2) {
            if (handRank >= 8){
                executeAllIn(player);
            }else if (handRank == 7) {
                executeRaise(player, Math.random() * 6000 + 3000);
            } else if (handRank >= 5) {
                if (riskLevel > 0.4) {
                    executeRaise(player, Math.random() * 5000 + 2000);
                } else {
                    check(player);
                }
            } else if (handRank === 4) {
                if (riskLevel > 0.7  || whoRaised == 0) {
                    check(player);
                } else {
                    fold(player);
                }
            } else {
                if (riskLevel > 0.4 && whoRaised != 0) {
                    fold(player);
                } else {
                    check(player);
                }
            }
        } else if (round === 3) {
            if (handRank >= 9) {
                executeAllIn(player);
            } else if (handRank >= 6) {
                if (riskLevel > 0.3) {
                    executeRaise(player, Math.random() * 7000 + 2000);
                } else {
                    check(player);
                }
            } else if (handRank >= 4) {
                if (riskLevel > 0.6  || whoRaised == 0) {
                    check(player);
                } else {
                    fold(player);
                }
            } else {
                if (riskLevel > 0.8 && whoRaised != 0) {
                    fold(player);
                } else {
                    check(player);
                }
            }
        } else if (round === 4) {
            if (handRank === 10) {
                executeAllIn(player);
            } else if (handRank >= 8) {
                executeRaise(player, Math.random() * 9000 + 5000);
            } else if (handRank >= 5) {
                if (riskLevel > 0.4) {
                    executeRaise(player, Math.random() * 6000 + 3000);
                } else {
                    check(player);
                }
            } else {
                if (riskLevel > 0.3 || whoRaised == 0) {
                    check(player);
                } else {
                    fold(player);
                }
            }
        }
    }, delay);

    function executeRaise(player, amount) {
        const raiseAmount = Math.floor(amount);
        document.querySelector(`#raiseAmt-${player}`).value = raiseAmount;
        raise(player);
    }

    function executeAllIn(player) {
        const playerObj = playersTotal.find(p => p.player === player);
        const raiseAmount = playerObj.total - betAmount;
        document.querySelector(`#raiseAmt-${player}`).value = raiseAmount;
        raise(player);
    }
}



function promptRaise(pl){
    if (turn != pl){
        showAlert('Not Your Turn', 'Please wait for your turn!');
        return;
    }
    let raiseCtn = document.querySelector(".raiseCtn-" + pl);
    if (raiseCtn.style.display == "block"){
        raiseCtn.style.display = "none";
        return
    }
    raiseCtn.style.display = "block";
}

function raise(pl){
    let raiseAmt = document.getElementById("raiseAmt-" + pl).value;
    const player = playersTotal.find(player => player.player === pl);
    raiseAmt = parseInt(raiseAmt);
    if (raiseAmt > player.total){
        showAlert('Not Enough Money', 'You don\'t have enough money!');
        return;
    }
    if (raiseAmt % 1000 != 0){
        showAlert('Invalid Amount', 'Please enter a multiple of 1000!');
        return;
    }
    if (betAmount + raiseAmt > player.total){
        showAlert('Not Enough Money', 'You can\'t raise that much!');
        return
    }
    betAmount += raiseAmt;
    betAmountPlayer(player, pl)
    document.getElementById("bet-amt").innerHTML = betAmount;
    whoRaised = pl;
    checkCallText(pl, true); // change text to call for other players
    calledPlayers.push(pl);
    turn++;
    pl++;
    checkTurn(turn);
    starterPlayer = pl-1;
    turns = 1;
    showPopup(`Player ${(pl-1)} raised $${raiseAmt}`);
}

function checkCallText(pl, toCall) {
    if (!toCall) {
        allPlayers.forEach(playerId => {
            const callBtn = document.getElementById(`callBtn-${playerId}`);
            if (callBtn) {
                callBtn.innerText = "Check";
            }
        });
    }else{
        allPlayers.forEach(playerId => {
            if (playerId !== pl) {
                const callBtn = document.getElementById(`callBtn-${playerId}`);
                if (callBtn) {
                    callBtn.innerText = "Call";
                }
            }else{
                const callBtn = document.getElementById(`callBtn-${playerId}`);
                if (callBtn) {
                    callBtn.innerText = "Check";
                }
            }
        });
    }
}

function addOneCard(){
    round++;
    if (round == 6){ // if all 5 cards are on the table, calculate the result
        document.getElementById("nextBtn").style.display = "block";
        showAlert('Game Over', 'Check the results!');
        calculateResult(playerCards);
        return;
    }
    let tableCards = document.querySelector(".table-cards");
    suit = cardSuit[Math.floor(Math.random() * 4)];
    plCard = cardNum[Math.floor(Math.random() * 13)];
    let tableCard = plCard + suit
    let cardSpan = document.createElement("span");
    cardSpan.textContent = " " + tableCard;
    if (suit == "♦" || suit == "♥") {
        cardSpan.style.color = "red";
    }else{
        cardSpan.style.color = "black";
    }
    tableCards.appendChild(cardSpan);
    playerCards.forEach(playerCard => {
        playerCard.cards += ", " + plCard + suit;
    });
}

function deal(reDeal = false){
    if(allPlayers.length < 2){
        showAlert('Add Players', 'Add atleast 2 players!');
        return;
    }
    checkTurn(turn)
    document.querySelector(".players").style.display = "block";
    document.querySelector(".community-cards").style.display = "block";
    document.getElementById("dealBtn").style.display = "none";
    document.getElementById("addPlayerBtn").style.display = "none";
    if (!reDeal){ // don't change total if re-dealing
        allPlayers.forEach(player => {
            let amt = document.getElementById("total-" + player);
            amt.innerHTML = "Total: $" + initialTotal;
        });
    }
    let cards = document.querySelectorAll(".cards");
    for (let i = 0; i < cards.length; i++) {
        cards[i].innerHTML = "";
        let playerCardList = [];
        for (let j = 0; j < 2; j++) {
            let card = document.createElement("div");
            let suit = cardSuit[Math.floor(Math.random() * 4)];
            let plCard = cardNum[Math.floor(Math.random() * 13)];
            if (suit === "♦" || suit === "♥") {
                card.style.color = "red";
            }else{
                card.style.color = "black";
            }
            card.innerHTML = plCard + suit;
            playerCardList.push(plCard + suit);
            cards[i].appendChild(card);
        }
        playerCards.push({ player: i + 1, cards: playerCardList.join(", ") });
    }
    // let tableCards = document.querySelector(".table-cards");
    // suit = cardSuit[Math.floor(Math.random() * 4)];
    // plCard = cardNum[Math.floor(Math.random() * 13)];
    // tableCard = plCard + suit
    // if (suit == "♦" || suit == "♥") {
    //     tableCards.style.color = "red";
    // }else{
    //     tableCards.style.color = "black";
    // }
    // tableCards.innerHTML = tableCard;
    // playerCards.forEach(playerCard => {
    //     playerCard.cards += ", " + plCard + suit;
    // });
    document.getElementById("bet-amt").innerHTML = betAmount;
}

function reDeal(){
    isGamePlayable();
    if (brokePlayers.length == playerCount - 1){
        showAlert('Too many broke players', 'Restart the game!');
        disableBtns();
        document.getElementById("restartBtn").style.display = "block";
        return;
    }
    turn = 1;
    foldedPlayers = [];
    round = 0;
    whoRaised = 0;
    refreshInfo();
    deal(true);
}

function fold(pl){
    if (turn != pl){
        showAlert('Not Your Turn', 'Please wait for your turn!');
        document.getElementById("restartBtn").style.display = "block";
        return;
    }
    turn++;
    checkTurn(turn);
    let actionBtns = document.querySelectorAll(".actionBtn-" + pl);
    for (let i = 0; i < actionBtns.length; i++) {
        actionBtns[i].disabled = true;
        actionBtns[i].style.color = "#ad0202";
    }
    let status = document.querySelector(".status-" + pl);
    status.innerHTML = "Status: Folded";
    foldedPlayers.push(pl);
    showPopup(`Player ${pl} folded`);
    turns++;
    gameStatus()
}

function check(pl){
    if (turn != pl){
        showAlert('Not Your Turn', 'Please wait for your turn!');
        return;
    }
    const player = playersTotal.find(player => player.player === pl);
    betAmountPlayer(player, pl)
    if (!allCalled){
        calledPlayers.push(pl);
    }
    turn++;
    pl++
    turns++;
    if(!allCalled){
        showPopup(`Player ${(pl-1)} called`);
    }else{
        showPopup(`Player ${(pl-1)} checked`);
    }
    checkTurn(turn);
}

function betAmountPlayer(player, pl){
    if (player.total < betAmount){
        showAlert('Not Enough Money', 'You don\'t have enough money!');
        let actionBtns = document.querySelectorAll(".actionBtn-" + pl);
        for (let i = 0; i < actionBtns.length; i++) {
            actionBtns[i].disabled = true;
            actionBtns[i].style.color = "#ad0202";
        }
        document.getElementById("tag-" + pl).style.color = "black";
        foldedPlayers.push(pl);
        brokePlayers.push(pl);
        document.querySelector(".status-" + pl).innerHTML = "Status: Out of Money";
        console.log("asdas")
        gameStatus()
        return;
    }
    if (allCalled){
        return
    }
    player.total -= betAmount;
    totalTable += betAmount;
    const amt = document.getElementById("total-" + pl);
    amt.innerHTML = `Total: $${player.total}`;
    document.querySelector(".total-table-bet").innerHTML = totalTable;
}

function gameStatus(){
    if (foldedPlayers.length == playerCount - 1){ // if only one player left, they win
        allPlayers.forEach(pl => {
            if (!foldedPlayers.includes(pl)){
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Won";
                const player = playersTotal.find(player => player.player === pl);
                player.total = player.total + totalTable;
                const amt = document.getElementById("total-" + pl);
                amt.innerHTML = `Total: $${player.total}`;
                showAlert('Game Over', 'Check the results!');
                let playr = document.getElementById("tag-" + pl);
                playr.style.color = "black";
                document.getElementById("nextBtn").style.display = "block";
            }
        })
    }
}

function calculateResult(playerCards) {
    const combos = playerCards.map(playerCard => combination(playerCard));
    console.log("combos", combos)
    const activeCombos = combos.filter(combo => !foldedPlayers.includes(combo.player));
    const winners = determineWinner(activeCombos);
    resultInfo(combos, winners);
    disableBtns();
}

function determineWinner(players) {
    console.log("players", players)

    const cardValue = card => {
        if (card === "A") return 14;
        if (card === "K") return 13;
        if (card === "Q") return 12;
        if (card === "J") return 11;
        return parseInt(card);
    };

    const compareHands = (player1, player2) => {
        if (handRanks[player1.hand] > handRanks[player2.hand]) return 1;
        if (handRanks[player1.hand] < handRanks[player2.hand]) return -1;
        const cards1 = player1.cards.split(", ").map(card => cardValue(card.slice(0, -1)));
        const cards2 = player2.cards.split(", ").map(card => cardValue(card.slice(0, -1)));
        cards1.sort((a, b) => b - a); 
        cards2.sort((a, b) => b - a);
        for (let i = 0; i < Math.min(cards1.length, cards2.length); i++) {
            if (cards1[i] > cards2[i]) return 1;
            if (cards1[i] < cards2[i]) return -1;
        }
        return 0;
    };
    let bestPlayers = [players[0]];
    for (let i = 1; i < players.length; i++) {
        const comparison = compareHands(players[i], bestPlayers[0]);
        if (comparison > 0) {
            bestPlayers = [players[i]]; 
        } else if (comparison === 0) {
            bestPlayers.push(players[i]); 
        }
    }
    return bestPlayers.map(player => player.player);
}


function combination(playerCard) {
    let cards = playerCard.cards.split(", ");
    let playerNum = playerCard.player;
    let cardNum = [];
    let cardSuit = [];
    let cardMapping = []; 

    cards.forEach(card => {
        let value = card.slice(0, -1);
        let suit = card.slice(-1);
        if (value === "A") value = 14; // Ace is higher than King
        else if (value === "K") value = 13;
        else if (value === "Q") value = 12;
        else if (value === "J") value = 11;

        value = parseInt(value);
        cardNum.push(value);
        cardSuit.push(suit);
        cardMapping.push({ value, suit }); // to return cards in sorted order
    });

    cardMapping.sort((a, b) => b.value - a.value);

    const sortedCards = cardMapping.slice(0, 7)
        .map(card => `${card.value > 10 ? faceCardValue(card.value) : card.value}${card.suit}`)
        .join(", ");

    if (isFlush(cardSuit)) {
        if (isStraight(cardNum)) {
            if (isRoyal(cardNum)) {
                return { player: playerNum, cards: sortedCards, hand: "Royal Flush" };
            }
            return { player: playerNum, cards: sortedCards, hand: "Straight Flush" };
        }
        return { player: playerNum, cards: sortedCards, hand: "Flush" };
    } else if (isStraight(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "Straight" };
    } else if (isFourOfAKind(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "Four of a Kind" };
    } else if (isFullHouse(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "Full House" };
    } else if (isThreeOfAKind(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "Three of a Kind" };
    } else if (isTwoPair(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "Two Pair" };
    } else if (isOnePair(cardNum)) {
        return { player: playerNum, cards: sortedCards, hand: "One Pair" };
    }

    // default to high card
    return { player: playerNum, cards: sortedCards, hand: "High Card" };
}

// return the face value of the card
function faceCardValue(value) {
    switch (value) {
        case 11: return "J";
        case 12: return "Q";
        case 13: return "K";
        case 14: return "A";
        default: return value;
    }
}

// logics for each hand
function isFlush(cardSuit) {
    const suitCounts = {};
    cardSuit.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);
    return Object.values(suitCounts).some(count => count >= 5);
}

function isStraight(cardNum) {
    const uniqueCards = Array.from(new Set(cardNum));
    uniqueCards.sort((a, b) => b - a);
    let consecutiveCount = 1;
    for (let i = 0; i < uniqueCards.length - 1; i++) {
        if (uniqueCards[i] - uniqueCards[i + 1] === 1) {
            consecutiveCount++;
            if (consecutiveCount >= 5) return true;
        } else {
            consecutiveCount = 1;
        }
    }
    return false;
}

function isRoyal(cardNum) {
    const royalCards = [14, 13, 12, 11, 10];
    return royalCards.every(card => cardNum.includes(card));
}

function isFourOfAKind(cardNum) {
    const counts = countOccurrences(cardNum);
    return Object.values(counts).some(count => count === 4);
}

function isFullHouse(cardNum) {
    const counts = countOccurrences(cardNum);
    const values = Object.values(counts);
    return values.includes(3) && values.includes(2);
}

function isThreeOfAKind(cardNum) {
    const counts = countOccurrences(cardNum);
    return Object.values(counts).some(count => count === 3);
}

function isTwoPair(cardNum) {
    const counts = countOccurrences(cardNum);
    return Object.values(counts).filter(count => count === 2).length >= 2;
}

function isOnePair(cardNum) {
    const counts = countOccurrences(cardNum);
    return Object.values(counts).some(count => count === 2);
}

function countOccurrences(array) {
    return array.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
}

function resultInfo(combinations, winners){
    combinations.forEach(combo => {
        let playerDiv = document.getElementById(`player-${combo.player}`);
        let handCards = document.createElement("div");
        handCards.id = "handCards-" + combo.player;
        handCards.innerHTML = "Cards: " + combo.cards;
        handCards.style.marginTop = "10px";
        playerDiv.appendChild(handCards);
        let hand = document.createElement("div");
        hand.id = "hand-" + combo.player;
        hand.innerHTML = "Hand: " + combo.hand;
        hand.style.fontWeight = "bold";
        hand.style.marginTop = "10px";
        playerDiv.appendChild(hand); // display the hand of each player
    });

    allPlayers.forEach(pl => {
        if (winners.length > 1) { // in the case of a tie
            if (winners.includes(pl)) {
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Won";
            } else {
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Lost";
            }
        } else {
            if (winners[0] == pl) {
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Won";
                const player = playersTotal.find(player => player.player === pl);
                player.total = player.total + totalTable;
                const amt = document.getElementById("total-" + pl);
                amt.innerHTML = `Total: $${player.total}`; // add bets on table to winner's total
            } else {
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Lost";
            }
            }
            if (foldedPlayers.includes(pl)) {
                let status = document.querySelector(".status-" + pl);
                status.innerHTML = "Status: Folded";
        }
    });
}

function disableBtns(){
    allPlayers.forEach(player => {
        let actionBtns = document.querySelectorAll(".actionBtn-" + player);
        for (let i = 0; i < actionBtns.length; i++) {
            actionBtns[i].disabled = true;
            actionBtns[i].style.color = "#ad0202";
        }
        let pl = document.getElementById("tag-" + player);
        pl.style.color = "black";
    });
}

// check if all are not broke
function isGamePlayable(){
    allPlayers.forEach(pl => {
        const playerObj = playersTotal.find(player => player.player === pl);
        if (playerObj.total == 0){
            if (!brokePlayers.includes(pl)){
                brokePlayers.push(pl);
            }
        }
    });
}

function refreshInfo(){
    turn = 1;
    foldedPlayers = [];
    playerCards = [];
    allInPlayers = [];
    document.querySelectorAll(".cards").innerHTML = '';
    round = 0;
    whoRaised = 0;
    totalTable = 0;
    allPlayers.forEach(player => {
        let status = document.querySelector(".status-" + player);
        status.innerHTML = "Status: Playing";
        let actionBtns = document.querySelectorAll(".actionBtn-" + player);
        for (let i = 0; i < actionBtns.length; i++) {
            actionBtns[i].disabled = false;
            actionBtns[i].style.color = "white";
        }
        let handCards = document.getElementById("handCards-" + player);
        if (handCards) handCards.remove();
        let hand = document.getElementById("hand-" + player);
        if (hand) hand.remove();
    });
    document.querySelector(".total-table-bet").innerHTML = 0;
    document.getElementById("bet-amt").innerHTML = 2000;
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
}

function showAlert(title, message) {
    const alertDialog = document.getElementById('alert-dialog');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertDialog.style.display = 'flex';
}

function closeAlert() {
    const alertDialog = document.getElementById('alert-dialog');
    alertDialog.style.display = 'none';
}
function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}