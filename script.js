/* 
** Title: Unit 19 Assessment 2 - Jeopardy
** Code written by: Asher Beckwith
*/

const request = 'http://jservice.io/api/';

// querySelectors
const board = document.querySelector('#jeopardy-board');
const restart_button = document.querySelector('#restart-button');
const start_button = document.querySelector('#start-button');

/* does element exist in array. for some dumb reason keyword 'in' doesn't work and I kept getting duplicate categories, so I just wrote my own implementation... god I hate JavaScript */
function exists(arr, element){
    return arr.some(function(value){
        return value === element;
    });
}

// refined 
async function getCategories() {
    const returns = await axios.get(`${request}/categories`, { params: {count: 100}});
    const data = returns.data;
    const idArr = [];
    const categories = [];

    while(categories.length < 6){
        const randIndex = Math.floor(Math.random() * data.length);
        const category = data[randIndex];
        if (!(exists(idArr, category.id)) && (category.clues_count >= 5)){
            idArr.push(category.id);
            categories.push(category);
        }
    }
    return categories;
}

async function getClues(id){
    const clues = await axios.get(`${request}/clues`, { params: { category : id } });
    return clues.data; // array of objects
}

// I want to return an array of 6 randomized clues objects along with there answers so that I can use them for later.
// NOTE: If I want to make the clues random than I need to make sure that the categories that I select have more than just 5 because it'll just slow down the function when you try to get 6 random clue from an category that only has 6 clues in it. Sucks... :P
async function getCluesList(categories){ // categories is an array of objects
    const clueList = [];
    for (category of categories){
        const clue = await getClues(category.id);
        clueList.push(clue);
    }
    return clueList;
}

// create an 2D array where every array contains an clue obj from each category
function createClueRows(clueArr){
    const rows = [];
    let j = 0;
    while(rows.length<5){
        const row = []; // need a new array of clues to append to rows
        for(let i=0; i<6; i++){
            const clue = clueArr[i][j];
            row.push(clue)
        }
        rows.push(row);
        j++;
    }

    return rows;
}

function getAnswer(x, y){
    return document.ROWSARR[x][y].answer;
}

function getQuestion(x, y){
    return document.ROWSARR[x][y].question;
}

/* loadBoard() gets information on categories and clues
** creates the headers which are the categories that user is going to be questioned on
** creates a table row element for each clue
** for loop gets one clue each time it passes through so that fixes the problem of setting categories to match the clues below it
** creates a table data element called 'clue' and sets .innerText to each of the clues in the cluesArray
** table row element is finished and appended to 'tableRow'*/

async function loadBoard(){
    // clears the board and creates new headers for the jeopardy board
    board.innerHTML = '';
    const header = document.createElement('tr')
    header.id = 'jeopardy-board-headers';
    board.append(header);

    const categories = await getCategories();
    const clueArray = await getCluesList(categories);

    const rows = createClueRows(clueArray);
    document.ROWSARR = rows;
    console.log(rows);
    console.log(document.ROWSARR);

    for (category of categories){
        header.innerHTML += `<th>${category.title.toUpperCase()}</th>`;
    }

    // new implementation
    let i = 0, j = 0;
    for (row of rows){
        const tableRow = document.createElement('tr');
        for (clue of row){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-x', i);
            tableData.setAttribute('data-y', j);
            tableData.setAttribute('data-clicked', 0);
            // tableData.innerText = clue.question;
            tableData.innerText = '?';

            tableRow.append(tableData);
            j++;
        }
        board.append(tableRow);
        i++;
        j = 0;
    }


    // while(rows < 5){
    //     const tableRow = document.createElement('tr');
    //     for(let i=0; i<clueArray.length; i++){
    //         const tableData = document.createElement('td');
    //         const currentClue = clueArray[i][j];
    //         if (currentClue.question !== '='){
    //             // tableData.innerText = currentClue.question;
    //             tableData.innerText = '?';
    //         }
    //         else{
    //             // tableData.innerText = clueArray[i][j + 1]; // skipping over '=' in clueList
    //             tableData.innerText = '?';
    //         }
    //         tableRow.append(tableData);
    //     }
    //     board.append(tableRow);
    //     j++;
    //     rows++;
    // }
}

// event listeners
start_button.addEventListener('click', function(event){
    event.preventDefault();
    loadBoard();
})

restart_button.addEventListener('click', function(event){
    event.preventDefault();
    loadBoard();
})

board.addEventListener('click', function(event){
    const td = event.target;
    if (td.localName === 'td'){
        const x = td.getAttribute('data-x');
        const y = td.getAttribute('data-y');
        const clicked = td.getAttribute('data-clicked');
        if (clicked === '0'){
            td.innerText = getQuestion(x, y);
            td.setAttribute('data-clicked', 1);
        }
        else{
            td.innerText = getAnswer(x, y);
        }
        console.log(`(${x}, ${y}) Clicks:${clicked}`);

    }
});
