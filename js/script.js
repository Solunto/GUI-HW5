/*
//	Intro. to GUI 1 HW5
//  By Ari Primak
//  This assignment was fun! :)
//  Date: 8/13/2021
*/

var tileArray = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "C", "C", "D", "D", "D", "D", "E",
"E",  "E", "E", "E",  "E", "E", "E",  "E", "E", "E", "E", "F", "F", "G", "G", "G", "H", "H", "I", "I", "I",
"I", "I", "I", "I", "I", "I", "J", "K", "L", "L", "L", "L", "M", "M", "N", "N", "N", "N", "N", "N", "O",
"O", "O", "O", "O", "O", "O", "O", "P", "P", "Q", "R", "R", "R", "R", "R", "R", "S", "S", "S", "S", "T",
"T", "T", "T", "T", "T", "U", "U", "U", "U", "V", "V", "W", "W", "X", "Y", "Y", "Z", "Blank", "Blank"];

var scoreArray = { "A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 5,
"L": 1, "M": 3, "N": 1, "O": 1, "P": 3, "Q": 10, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 4, "X": 8,
"Y": 4, "Z": 10, "Blank": 0 };

//For storing indices of tileArray that have been "consumed"
var usedTiles = [];

//For convenient tile creation
var cannedImg = "graphics_data/Scrabble_Tile_";

//Is there a card in this slot in hand?
var handHas = {"h1": false, "h2": false, "h3": false, "h4": false, "h5":false, "h6": false, "h7": false};

var totalScore = 0;

var wPlay = 0;

$().ready(function() {

    $('#lineframe > p').droppable({
        drop: function(event, ui) {
            //Disable all squares on the line
            $('#lineframe > p').droppable("disable");
            //Re-enable the only valid one, the one to the right of the square that just had a tile placed on it
            //If the tile was placed on the rightmost (last sibling!) square, nothing will be enabled.
            $(this).next('p').droppable("enable");

            //Tag the draggable for scoring purposes
            ui.draggable.addClass($(this).attr('class'));
            ui.draggable.addClass($(this).attr('id'));

            //Stop the draggable from being moved off the square
            ui.draggable.draggable("disable");
            //Take note that the draggable is no longer in hand and the slot it was in is empty
            handHas["" + ui.draggable.attr('h')] = false;
        },

        tolerance: "fit"
    });

    $('#start').click(function() {
        dealStartingHand();
    });

    $('#sbmt').click(function() {
        tallyScore();
    });

    $('#quit').click(function() {
        gameOver();
    })
})

//To start a round, deal a new hand from a fresh tileset with all 100 tiles included
function dealStartingHand() {
    //Set text back to default color
    $('.end').removeClass("endColor");

    //New round, new tileset (none have been used)
    usedTiles = [];
    var handSize = 1;

    //Score resets to 0
    totalScore = 0;

    //0 words have been played
    wPlay = 0;
    $('#final').html("Words played: " + wPlay);

    //Hand is empty because no tiles have been dealt
    for (var h in handHas)
        handHas[h] = false;

    //Destroy all existing tiles
    $('.tileImg').remove()

    //Reset the board so all squares are turned on
    $('.ui-droppable').droppable("enable");

    //Turn the submit button back on in case it was turned off by the ending of a prior game.
    $('#sbmt').attr("disabled", false);

    while (handSize <= 7) {
        //The code for this rng invocation comes from Mozilla's docs: 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        //If an index that has already been "consumed" comes up again, it is invalid.
        var indx = Math.floor(Math.random() * 100);
        if (!(usedTiles.includes(indx))) {
            var newImg = document.createElement("img");
            newImg.src = cannedImg + tileArray[indx] + ".jpg";
            //Make the img into a draggable widget.
            createDrag(newImg);
            //Give each image a class so they can be styled (sized, really)
            newImg.className += " tileImg ";
            //Also give them an attr with their tile identity for help with scoring later
            newImg.setAttribute("tileID", tileArray[indx]);
            //Also mark which slot in hand they are placed into
            newImg.setAttribute("h", "h" + handSize);
            $('#hand' + handSize).append(newImg);

            handHas["h" + handSize] = true;
            handSize += 1;
            usedTiles.push(indx);
        }
        //In the case the above statement is false, the loop begins again without increasing handSize
        //or adding a tile to hand. 
    }
}

function tallyScore() {
    //If there are no tiles on the board (ie. 7 tiles are in hand), do not do anything
    var full = true;
    for (var h in handHas) {
        //If every tile is in hand, handHas[h] is true for every h. Therefore full will continue to be true and the function will
        //subsequently return without doing anything.
        //If there is at least one empty slot in hand, handHas[h] will evaluate false for some value h and the function will not return.
        if (!handHas[h])
            full = false;
    }
    if (full)
        return;

    //An additonal word has been submitted
    wPlay += 1;
    $('#final').html("Words played: " + wPlay);
    var sum = 0;
    var dblWSq = 0;
    $('img.ui-draggable-disabled').each(function(i) {
        //Get the score for the letter the tile has on it
        var tileScore = scoreArray[$(this).attr('tileID')]
        //If the square the tile is placed on is a double letter square, double the tileScore
        if ($(this).hasClass('dblL'))
            tileScore *= 2;
        //If the square the tile is placed on is a double word square, take note of that
        if ($(this).hasClass('dblW'))
            dblWSq += 1;
        sum += tileScore;
    });
    //If at least one double word square was occupied, multiply the sum by the number of 
    //double word squares occupied times 2 (1 occupied = 2x; 2 occupied = 4x)
    if (dblWSq > 0)
        sum *= dblWSq * 2;
    
    totalScore += sum;

    $('#scoreTally').html("Last word score: " + sum + " -- Total score: " + totalScore);

    //Clean up the board (line)
    $('img.ui-draggable-disabled').remove();

    //Necessary bookkeeping, I'm 100% certain there is a nicer way to do this
    var handSlot = 0;
    //Deal new tiles to empty slots in hand
    for (var h in handHas) {
        handSlot += 1;
        //If all 100 tiles have been dealt, the game ends. If this check happened after the while(indx...etc) loop the program would loop forever
        if (usedTiles.length == 100) {
            gameOver();
            break;
        }
        //The value stored for the key h will be True or False, so it doesn't need to be compared to anything
        //If the value is true, there's already a card in that slot in hand, so we don't want to draw a new one
        if (handHas[h])
            continue;

        //The code for this rng invocation comes from Mozilla's docs: 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        //If an index that has already been "consumed" comes up again, it is invalid.
        var indx;
        //The body of the loop doesn't exist because only the condition is necessary to advance indx to a valid value.
        while (usedTiles.includes((indx = Math.floor(Math.random() * 100))))
            ;
       
        var newImg = document.createElement("img");
        newImg.src = cannedImg + tileArray[indx] + ".jpg";
        //Make the img into a draggable widget.
        createDrag(newImg);
        //Give each image a class so they can be styled (sized, really)
        newImg.className += " tileImg ";
        //Also give them an attr with their tile identity for help with scoring later
        newImg.setAttribute("tileID", tileArray[indx]);
        //Also mark which slot in hand they are placed into
        newImg.setAttribute("h", "h" + handSlot);
        $('#hand' + handSlot).append(newImg);
        
        handHas["h" + handSlot] = true;
        usedTiles.push(indx);
        //In the case the above statement is false, the loop begins again without adding a tile to hand

        
    }
    //Reset the board so all squares are turned on
    $('.ui-droppable').droppable("enable");
}

function gameOver() {

    //Disable further tile placement
    $('.ui-draggable').draggable("disable");

    //Change the color of text to indicate the game is over
    $('.end').addClass("endColor");

    //Disable the submit button to avoid shenanigans
    $('#sbmt').attr("disabled", true);
}

function createDrag(drgImg) {
    $(drgImg).draggable({
        revert: "invalid",

        snap: '#lineframe > p:not(ui-droppable-disabled)',
        
        snapMode: "inner"
    });
}
